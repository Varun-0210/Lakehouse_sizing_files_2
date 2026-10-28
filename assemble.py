"""Builds ../index.html from the source files in this folder.
Run:  python3 assemble.py
"""
import os
here = os.path.dirname(os.path.abspath(__file__))
read = lambda f: open(os.path.join(here, f), encoding="utf-8").read()
script = "".join(read(f) + "\n" for f in ["model.js", "engine.js", "export.js", "ui.js"])
html = read("page.html") + script + "init();\n</script></body></html>\n"
out = os.path.join(here, "..", "index.html")
open(out, "w", encoding="utf-8").write(html)
print("wrote", os.path.normpath(out), len(html), "bytes")
