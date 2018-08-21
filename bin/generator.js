#!/usr/bin/env node

var app = require('../app');

var imagemin = require("imagemin");    // The imagemin module
var webp = require("imagemin-webp");   // imagemin's WebP plugin
var debug = require('debug')('PhotoBookGen')

var outputFolder = "D:\\IdeaProjects\\PhotoBookGen\\generated\\images";            // Output folder
var JPEGImages = "D:\\IdeaProjects\\PhotoBookGen\\generated\\source\\*.jpg";        // JPEG images

console.log("Generating WebP files in  " +  outputFolder);

imagemin([JPEGImages], outputFolder, {
    plugins: [webp({
        quality: 75 // Quality setting from 0 to 100
    })]
});

