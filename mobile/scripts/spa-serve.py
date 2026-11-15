import http.server, os, sys
class H(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        p = self.translate_path(self.path.split('?')[0])
        if not os.path.exists(p): self.path = '/index.html'
        return super().do_GET()
os.chdir(sys.argv[1]); http.server.ThreadingHTTPServer(('', int(sys.argv[2])), H).serve_forever()
