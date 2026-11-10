import http.server
import os
import socket
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class DualStackThreadingServer(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6
    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        return super().server_bind()

class FastCachingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        if self.path.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.svg')):
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        elif self.path == '/' or self.path.lower().endswith('.html'):
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # Suppress logging every individual frame asset to keep console clean
        pass

if __name__ == '__main__':
    server_address = ('::', PORT)
    try:
        httpd = DualStackThreadingServer(server_address, FastCachingHandler)
    except Exception:
        # Fallback to standard IPv4 if IPv6 dual-stack fails
        httpd = http.server.ThreadingHTTPServer(('0.0.0.0', PORT), FastCachingHandler)

    print(f"Serving on http://localhost:{PORT}/ and http://127.0.0.1:{PORT}/")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        sys.exit(0)
