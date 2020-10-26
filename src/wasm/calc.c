#include <stdio.h>
#include <math.h>
#include <emscripten.h>

extern "C"{
	float EMSCRIPTEN_KEEPALIVE b(float lnSqrtX, float h){
		return -0.64 * powf(-0.004 * h + lnSqrtX - 3.31, 2);
	}

	float EMSCRIPTEN_KEEPALIVE c(float lnSqrtX, float h){
		return 0.173611 * powf(-0.005 * h + lnSqrtX - 3.1, 2) + 0.0015 * h;
	}

	float EMSCRIPTEN_KEEPALIVE calcDeposition(int x, float u, float n, float h, float Q){
		float a = 5.9 * (7.35 * n + 0.26) * (0.4 - 0.06 * logf(h));
		float lnSqrtX = logf(sqrtf(x));
		return a * expf(b(lnSqrtX, h)) * powf(u, -1.25 * expf(c(lnSqrtX, h))) * Q;
	}
}
