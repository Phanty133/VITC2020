#include <stdio.h>
#include <math.h>
#include <emscripten.h>

#define degToRadConst 0.017453293

extern "C"{
	extern float randFloat();
	
	struct Geocoord{
		float lat;
		float lng;
	};

	struct DataPoint {
		Geocoord coord;
		float value;
	};

	float setLowerBound(float val, float min){
		if(val < min) return min;
		return val;
	}

	Geocoord sumGeocoords(Geocoord a, Geocoord b){
		Geocoord newCoord;

		newCoord.lat = a.lat + b.lat;
		newCoord.lng = a.lng + b.lng;

		return newCoord;
	}

	float EMSCRIPTEN_KEEPALIVE calcDeposition(int x, float u, float n, float h, float Q){ // Fastest for a small amount of iterations (<=10000)
		float a, b, c, lnSqrtX;

		lnSqrtX = logf(sqrtf(x));
		a = 5.9 * (0.4 - 0.06 * logf(h)) * expf(-powf(((lnSqrtX - 0.004 * h - 3.31)/1.25), 2));
		b = 0.26 + 7.35 * n;
		c = -1.25 * expf(0.0015 * h + powf((lnSqrtX - 0.005 * h - 3.1) / 2.4, 2));

		return a * b * Q * powf(u, c);
	}

	float EMSCRIPTEN_KEEPALIVE calcDeposition1(int x, float u, float n, float h, float Q){ // Fastest for a large amount of iterations (>10000)
		float a, b, c, lnSqrtX;

		lnSqrtX = logf(sqrtf(x));
		a = 5.9 * (7.35 * n + 0.26) * (0.4 - 0.06 * logf(h));
		b = -0.64 * powf(-0.004 * h + lnSqrtX - 3.31, 2);
		c = 0.173611 * powf(-0.005 * h + lnSqrtX - 3.1, 2) + 0.0015 * h;

		return a * expf(b) * powf(u, -1.25 * expf(c)) * Q;
	}

	void EMSCRIPTEN_KEEPALIVE generateRandomPointInCircle(float radius, Geocoord* buffer){
		float theta = 2 * M_PI * randFloat();
		float r = sqrtf(randFloat());
		float k = r * radius;

		buffer->lng = k * cosf(theta);
		buffer->lat = k * sinf(theta);
	}

	void EMSCRIPTEN_KEEPALIVE generateRandomPointInSquare(float a, Geocoord* buffer){
		buffer->lat = randFloat() * a;
		buffer->lng = randFloat() * a;
	}

	float EMSCRIPTEN_KEEPALIVE geoPointDistance(float p1lat, float p1lng, float p2lat, float p2lng){ // Returns distance in meters
		const int R = 6371000; // Radius of the earth in meters
		float a, c, dlat, dlng, phi1, phi2;

		phi1 = p1lat * degToRadConst;
		phi2 = p2lat * degToRadConst;
		dlat = (p2lat - p1lat) * degToRadConst;
		dlng = (p2lng - p1lng) * degToRadConst;

		a = powf(sinf(dlat / 2), 2) + cosf(phi1) * cos(phi2) * powf(sinf(dlng / 2), 2);
		c = 2 * atan2f(sqrtf(a), sqrtf(1 - a));
		return R * c;
	}

	void EMSCRIPTEN_KEEPALIVE generateRandomDataPoints(int dataPointCount, float radius, Geocoord center, DataPoint* buffer){
		int i;

		for(i = 0; i < dataPointCount; i++){
			DataPoint point;
			Geocoord coordBuffer;

			generateRandomPointInCircle(radius, &coordBuffer);
			point.coord = sumGeocoords(coordBuffer, center);
			point.value = geoPointDistance(center.lat, center.lng, point.coord.lat, point.coord.lng);

			*(buffer + i) = point; // Write to allocated memory address
		}
	}

	float EMSCRIPTEN_KEEPALIVE angleFromPointToCenter(Geocoord p, Geocoord c){
		return ((int) (atan((double) abs((p.lat - c.lat) / (p.lng - c.lng))) / degToRadConst) + 360) % 360 * degToRadConst;
	}

	Geocoord EMSCRIPTEN_KEEPALIVE transformPointRelativeToWind(Geocoord p, Geocoord c, float windAngle){
		Geocoord newCoord;
		float px, py;
		float theta = windAngle;

		// Remove center offset
		py = p.lat - c.lat;
		px = p.lng - c.lng;

		if(px > 0){
			theta = theta + M_PI;
		}

		// Rotate point around origin and add center offset
		newCoord.lat = px * cosf(theta) - py * sinf(theta) + c.lat;
		newCoord.lng = py * cosf(theta) + px * sinf(theta) + c.lng;

		return newCoord;
	}

	float EMSCRIPTEN_KEEPALIVE relativeWindspeedAtPoint(Geocoord p, Geocoord c, float cSpeed){
		return cSpeed * angleFromPointToCenter(p, c) / (M_PI / 2); // angleFromPointToCenter is in the interval [0; pi/2]
	}

	void EMSCRIPTEN_KEEPALIVE calculateRandomDataPoints(
		int dataPointCount, 
		float radius, 
		Geocoord center, 
		float windSpeed,
		float windSpeedMin,
		float windAngle,
		float Q,
		int h,
		float n,
		DataPoint* buffer
	){
		// Allocate memory for generated data points
		// DataPoint* pointBuffer = (DataPoint*) malloc(dataPointCount * sizeof(DataPoint));

		generateRandomDataPoints(dataPointCount, radius, center, buffer);

		int i;
		for(i = 0; i < dataPointCount; i++){
			DataPoint p = *(buffer + i);
			int x = (int) p.value;
			float u = setLowerBound(relativeWindspeedAtPoint(p.coord, center, windSpeed), windSpeedMin);
			float val = calcDeposition(x, u, n, h, Q);

			p.coord = transformPointRelativeToWind(p.coord, center, windAngle);
			p.value = val;

			*(buffer + i) = p;
		} 
	}

	int EMSCRIPTEN_KEEPALIVE distanceToRandomPoint(float radius, float clat, float clng, Geocoord* buffer){
		Geocoord center;
		center.lat = clat;
		center.lng = clng;

		generateRandomPointInCircle(radius, buffer);
		return geoPointDistance(center.lat, center.lng, center.lat + buffer->lat, center.lng + buffer->lng);
	}

	void EMSCRIPTEN_KEEPALIVE plotWindspeed(Geocoord c, float windSpeed, float windAngle, int dataPointCount, float radius, DataPoint* buffer){
		generateRandomDataPoints(dataPointCount, radius, c, buffer);
		
		int i;
		for(i = 0; i < dataPointCount; i++){
			DataPoint p = *(buffer + i);
			float val = relativeWindspeedAtPoint(p.coord, c, windSpeed);
			
			p.value = val;
			p.coord = transformPointRelativeToWind(p.coord, c, windAngle);

			*(buffer + i) = p;
		}
	}

	void EMSCRIPTEN_KEEPALIVE windTest(float windSpeed, float windAngle, int pointCount, float radius, DataPoint* buffer){
		Geocoord c;
		c.lat = 56.792;
		c.lng = 23.577;

		plotWindspeed(c, windSpeed, windAngle, pointCount, radius, buffer);
	}

	void EMSCRIPTEN_KEEPALIVE calcFrameWrapper(
		float windSpeed, 
		float windSpeedMin,
		float clat, 
		float clng, 
		float windAngle, 
		int pointCount, 
		float radius, 
		float Q,
		int h,
		float n,
		DataPoint* buffer
	){
		Geocoord c;
		c.lat = clat;
		c.lng = clng;

		calculateRandomDataPoints(pointCount, radius, c, windSpeed, windSpeedMin, windAngle, Q, h, n, buffer);
	}

	void EMSCRIPTEN_KEEPALIVE calcDatasetWrapper(
		float windSpeedMin,
		float clat,
		float clng,
		int pointCount,
		float radius,
		float Q,
		int h,
		float n,
		int frameCount,
		float* windSpeed,
		float* windAngle,
		DataPoint* buffer
	){
		Geocoord c;
		c.lat = clat;
		c.lng = clng;

		int i;

		for(i = 0; i < frameCount; i++){
			calculateRandomDataPoints(
				pointCount, 
				radius, 
				c, 
				*(windSpeed + i),
				windSpeedMin,
				*(windAngle + i),
				Q,
				h,
				n,
				buffer + i * pointCount
			);
		}
	}
}
