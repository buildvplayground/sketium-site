import http.server, mimetypes, os, functools
mimetypes.add_type("image/webp", ".webp")
mimetypes.add_type("image/png", ".png")
mimetypes.add_type("text/css", ".css")
mimetypes.add_type("application/javascript", ".js")
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Site")
H = functools.partial(http.server.SimpleHTTPRequestHandler, directory=D)
http.server.HTTPServer(("127.0.0.1", 4180), H).serve_forever()
