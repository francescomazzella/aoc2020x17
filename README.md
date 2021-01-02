# Three-dimensional Conway's Game Of Life Visualizer
A three-dimensional visualization of Conway's Blocks for the [Advent Of Code](https://adventofcode.com/) ([year 2020, day 17](https://adventofcode.com/2020/day/17)) with fancy old CRT monitor post-processing effects, because… why not?

![visualizer](cbv-capture.gif)

I long needed an excuse to play with three.js, 3D graphics and realtime rendering.
Although this is a simple project, I learned a lot about GLSL and shaders.

# Features
* Possibility to change the input
* Web Worker for the computing the result
* [three.js](https://threejs.org/) for rendering
* Shaders to make it ✨ *fancy* ✨

# Credits
* "Brown CRT shader" based on [notargs's work](http://wordpress.notargs.com/blog/blog/2016/01/09/unity3dブラウン管風シェーダーを作った/)
* Bootstrapped with [Static HTML Webpack Boilerplate](https://github.com/erickzhao/static-html-webpack-boilerplate/releases)