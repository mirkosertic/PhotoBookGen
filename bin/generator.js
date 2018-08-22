#!/usr/bin/env node

const app = require('../app');

const fs = require('fs');
const path = require('path');
const sharp = require("sharp");
const handlebars = require('handlebars')
const debug = require('debug')('PhotoBookGen')

const outputFolder = app.configuration.outputFolder;
const JPEGImages = app.configuration.imagesSourceFolder;

console.log("Generating Files in  " +  outputFolder);

// We search for all Images for our Gallery
fs.readdir(app.configuration.imagesSourceFolder, function(error, files) {

    // We need a sorted list of them
    const sorted = files.map(function (fileName) {
        return {
            name: fileName,
            time: fs.statSync(path.join(app.configuration.imagesSourceFolder, fileName)).mtime.getTime()
        };
    })
    .sort(function (a, b) {
            return a.time - b.time; })
    .map(function (v) {
            return v.name; });

    const imagesBasePath = path.join(app.configuration.outputFolder, "images");
    if (!fs.existsSync(imagesBasePath)){
        fs.mkdirSync(imagesBasePath);
    }

    // Then we have to transform them to WebP and JPEG original and thumbnails
    for (var i=0;i<sorted.length;i++) {

        const nameOnDisk = path.join(JPEGImages, sorted[i]);
        const nameWithoutExtention = path.basename(sorted[i], path.extname(sorted[i]));

        // Original to WebP
        console.log("Transforming " + nameOnDisk + " to WebP");
        sharp(nameOnDisk)
            .toFile(path.join(imagesBasePath, nameWithoutExtention + ".webp"), function(error, info) {
            });

        console.log("Transforming " + nameOnDisk + " to Progressive-JPEG");
        sharp(nameOnDisk)
            .jpeg({
                quality: app.configuration.jpeg.quality,
                progressive: true
            })
            .toFile(path.join(imagesBasePath, nameWithoutExtention + ".jpg"), function(error, info) {
            });

        console.log("Transforming " + nameOnDisk + " to Small-Size WebP");
        sharp(nameOnDisk)
            .resize(300)
            .toFile(path.join(imagesBasePath, nameWithoutExtention + "_small.webp"), function(error, info) {
            });

        console.log("Transforming " + nameOnDisk + " to Small-Size JPEG");
        sharp(nameOnDisk)
            .resize(300)
            .jpeg({
                quality: app.configuration.jpeg.quality,
                progressive: true
            })
            .toFile(path.join(imagesBasePath, nameWithoutExtention + "_small.jpg"), function(error, info) {
            });
    }

    // And finally we generate the html files
    console.log("Generating HTML files");

    function htmlFilenameFor(index) {
        return "index" + (index > 0 ? index : '') + ".html"
    }

    fs.readFile("template.hbs", "utf8", function(error, data) {

        const template = handlebars.compile(data);

        for (var i=0;i<sorted.length;i++) {

            const nameWithoutExtention = path.basename(sorted[i], path.extname(sorted[i]));
            const currentFileName = htmlFilenameFor(i);

            const previousImages = [];
            for (var j=i-1; j>=0 && j>=i-4;j--) {

                const prevNameWithoutExtention = path.basename(sorted[j], path.extname(sorted[i]));

                previousImages.push({
                    imageJPEG: 'images/' + prevNameWithoutExtention + "_small.jpg",
                    imageWebP: 'images/' + prevNameWithoutExtention + "_small.webp",
                });
            }

            const nextImages = [];
            for (var j=i + 1; j <= i + 4 && j<sorted.length;j++) {

                const prevNameWithoutExtention = path.basename(sorted[j], path.extname(sorted[j]));

                nextImages.push({
                    imageJPEG: 'images/' + prevNameWithoutExtention + "_small.jpg",
                    imageWebP: 'images/' + prevNameWithoutExtention + "_small.webp",
                });
            }

            const templateData = {
                gallery: app.configuration.html,
                current: {
                    fileName: currentFileName,
                    imageJPEG: 'images/' + nameWithoutExtention + ".jpg",
                    imageWebP: 'images/' + nameWithoutExtention + ".webp",
                },
                navigation: {
                    index: (i + 1),
                    size: sorted.length,
                    prevLink: i>0 ? htmlFilenameFor(i - 1) : undefined,
                    nextLink: i<sorted.length - 1 ? htmlFilenameFor(i + 1) : undefined,
                },
                prev: previousImages,
                next: nextImages
            };

            const output = fs.createWriteStream(path.join(app.configuration.outputFolder, currentFileName));
            output.once("open", function(fd) {
                const html = template(templateData);
                output.write(html);
                output.end();
            });
        }
    });
});
