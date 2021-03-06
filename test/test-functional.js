'use strict';

const http = require('http');
const fs = require('fs');
const assert = require('assert');
const sizeOf = require('image-size');

const urlToImage = require('../src/index');

describe('urlToImage', function() {

    const server = http.createServer(function(req, res) {
        res.end('<html>test</html>');
    });

    before(function(done) {
        server.listen(9000);
        server.on('listening', done);
    });

    after(function(done) {
        server.close();
        done();
    });

    describe('render', function() {
        this.timeout(20000);

        it('should render test image', function(done) {
            urlToImage('http://localhost:9000', 'localhost.png')
            .then(function() {
                const dimensions = sizeOf('localhost.png');
                assert.equal(dimensions.width, 1280, 'default width is incorrect');
                fs.unlinkSync('localhost.png');
                done();
            });
        });

        it('should render image in custom size', function(done) {
            urlToImage(
                'http://localhost:9000',
                'localhost.png', {
                    width: 800,
                    height: 600
                }
            )
            .then(function() {
                const dimensions = sizeOf('localhost.png');

                assert.equal(dimensions.width, 800, 'width is incorrect');

                // The content of test page is so small, so viewport
                // is larger than content. If content were larger,
                // urlToImage's height could be bigger than viewport's width
                assert.equal(dimensions.height, 600, 'height is incorrect');

                fs.unlinkSync('localhost.png');
                done();
            });
        });

        it('should fail to incorrect url', function(done) {
            this.timeout(5000);

            urlToImage(
                'http://failure',
                'localhost.png', {
                    width: 800,
                    height: 600
                }
            )
            .catch(function(err) {
                done();
            });
        });
    });
});
