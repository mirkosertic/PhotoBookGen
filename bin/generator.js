#!/usr/bin/env node

var app = require('../app');

var sharp = require("sharp");
var debug = require('debug')('PhotoBookGen')

var outputFolder = "D:\\IdeaProjects\\PhotoBookGen\\generated\\images";            // Output folder
var JPEGImages = "D:\\owncloud_hochzeit\\Hochzeit\\Fotos\\*.jpg";        // JPEG images

console.log("Generating WebP files in  " +  outputFolder);

sharp("D:\\IdeaProjects\\PhotoBookGen\\generated\\source\\Hochzeit_22.07.2018-1.jpg")
    .toFile("D:\\IdeaProjects\\PhotoBookGen\\generated\\images\\large.webp");

sharp("D:\\IdeaProjects\\PhotoBookGen\\generated\\source\\Hochzeit_22.07.2018-1.jpg")
    .resize(400)
    .toFile("D:\\IdeaProjects\\PhotoBookGen\\generated\\images\\small.webp");

sharp("D:\\IdeaProjects\\PhotoBookGen\\generated\\source\\Hochzeit_22.07.2018-1.jpg")
    .resize(400)
    .jpeg({
        quality: 90,
        progressive: true
    })
    .toFile("D:\\IdeaProjects\\PhotoBookGen\\generated\\images\\small.jpeg");
