package main

import (
	"fmt"
	"github.com/aarol/reload"

	"net/http"
)

func main() {

	fmt.Println("no time to fret")

	mux := http.NewServeMux()

	fs := http.FileServer(http.Dir("."))
	mux.Handle("/assets/", fs)

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "index.html")
	})

	// live reloader for JS/HTML/CSS as well
	isDevelopment := true
	var reloadHandler http.Handler = mux

	if isDevelopment {
		// Call `New()` with a list of directories to recursively watch
		reloader := reload.New(".")

		// Optionally, define a callback to
		// invalidate any caches
		reloader.OnReload = func() {
			fmt.Println("reloaded")
		}

		// Use the Handle() method as a middleware
		reloadHandler = reloader.Handle(reloadHandler)
	}

	http.ListenAndServe(":80", reloadHandler)
}
