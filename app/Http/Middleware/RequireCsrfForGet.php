<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RequireCsrfForGet
{
    /**
     * For GET/HEAD requests on protected routes, require a valid CSRF token
     * either via the XSRF-TOKEN cookie (Sanctum-style) or X-CSRF-TOKEN header.
     */
    public function handle(Request $request, Closure $next)
    {
        if (in_array($request->method(), ['GET', 'HEAD'])) {
            $sessionToken = $request->session()->token(); // same as csrf_token()

            $headerToken = $request->header('X-CSRF-TOKEN');
            $cookieToken = $request->cookie('XSRF-TOKEN'); // unencrypted token

            if (!is_string($sessionToken) || $sessionToken === '') {
                return abort(403, 'CSRF token missing from session.');
            }

            if (hash_equals($sessionToken, (string) $headerToken)) {
                return $next($request);
            }

            if (hash_equals($sessionToken, (string) $cookieToken)) {
                return $next($request);
            }

            return abort(403, 'Invalid or missing CSRF token.');
        }

        return $next($request);
    }
}


