
/**
    Object > Shape
    The Shape object is the high level object that
    represents an outline.  The Glyph object treats
    Shape objects and Component Instance objects
    interchangeably - any method added to Shape
    should also be added to Component Instance.
**/
class Shape {
    constructor(oa) {
        // debug('\n SHAPE - START');
        oa = oa || {};
        this.objType = 'shape';
        // common settings
        this.name = oa.name || 'Shape';
        this.path = isVal(oa.path) ? new Path(oa.path) : rectPathFromMaxes(false);
        this.visible = isVal(oa.visible) ? oa.visible : true;
        this.xLock = oa.xLock || false;
        this.yLock = oa.yLock || false;
        this.wlock = oa.wlock || false;
        this.hlock = oa.hlock || false;
        this.ratiolock = oa.ratiolock || false;
        // debug(' SHAPE - END\n');
    }
    // --------------------------------------------------------------
    // SHAPE Methods
    // --------------------------------------------------------------
    getName() {
        return this.name;
    }
    changed() {
        this.path.changed();
    }
    drawShape(lctx, view) {
        // debug('\n Shape.drawShape - START');
        // debug('\t view ' + json(view, true));
        if (this.visible) {
            if ((this.path.maxes.xMax === -1) &&
                (lctx === _UI.glyphEditCTX) &&
                (_UI.selectedTool !== 'newpath')) {
                this.calcMaxes();
            }
            this.path.drawPath(lctx, view);
        }
        // debug(' Shape.drawShape - returning true by default - END\n');
        return true;
    }
    // --------------------------------------------------------------
    // DRAWING THE SELECTION OUTLINE AND BOUNDING BOX
    // --------------------------------------------------------------
    draw_PathOutline(accent, thickness) {
        // debug('\n Shape.draw_PathOutline - START');
        accent = accent || _UI.colors.blue;
        thickness = thickness || 1;
        draw_PathOutline(this, accent, thickness);
    }
    draw_BoundingBox(accent, thickness) {
        // debug('\n Shape.draw_BoundingBox - START');
        accent = accent || _UI.colors.blue;
        thickness = thickness || 1;
        draw_BoundingBox(this.path.maxes, accent, thickness);
    }
    draw_BoundingBoxHandles(accent, thickness) {
        // debug('\n Shape.draw_BoundingBoxHandles - START');
        accent = accent || _UI.colors.blue;
        thickness = thickness || 1;
        draw_BoundingBoxHandles(this.path.maxes, accent, thickness);
    }
    // --------------------------------------------------------------
    // TRANSLATE TO DIFFERENT LANGUAGES
    // --------------------------------------------------------------
    makeSVG(size, gutter) {
        size = size || _UI.thumbSize;
        gutter = gutter || _UI.thumbGutter;
        let upm = _GP.projectSettings.upm;
        let desc = upm - _GP.projectSettings.ascent;
        let charscale = (size - (gutter * 2)) / size;
        let gutterscale = (gutter / size) * upm;
        let vbsize = upm - (gutter * 2);
        let re = '<svg version="1.1" ';
        re += 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ';
        re += 'width="' + size + '" height="' + size + '" viewBox="0,0,' + vbsize + ',' + vbsize + '">';
        re += '<g transform="translate(' + (gutterscale) + ',' + (upm - desc - (gutterscale / 2)) + ') scale(' + charscale + ',-' + charscale + ')">';
        // re += '<rect x="0" y="-'+desc+'" height="'+desc+'" width="1000" fill="lime"/>';
        // re += '<rect x="0" y="0" height="'+(upm-desc)+'" width="1000" fill="cyan"/>';
        re += '<path d="';
        re += this.path.svgPathData;
        re += '"/>';
        re += '</g>';
        re += '</svg>';
        return re;
    }
    makePostScript(lastx, lasty) {
        return this.path ? this.path.makePathPostScript(lastx, lasty) : { 're': '', 'lastx': lastx, 'lasty': lasty };
    }
    makeOpentypeJsPath(otpath) {
        return this.path.makeOpentypeJsPath(otpath);
    }
    // --------------------------------------------------------------
    // PATH WRAPPER FUNCTIONS FOR COMPONENT INSTANCE PARITY
    // --------------------------------------------------------------
    updateShapePosition(dx, dy, force) {
        this.path.updatePathPosition(dx, dy, force);
    }
    setShapePosition(nx, ny, force) {
        this.path.setPathPosition(nx, ny, force);
    }
    updateShapeSize(dx, dy, ratiolock) {
        this.path.updatePathSize(dx, dy, ratiolock);
    }
    setShapeSize(nx, ny, ratiolock) {
        this.path.setPathSize(nx, ny, ratiolock);
    }
    isOverControlPoint(x, y, targetSize, noHandles) {
        return this.path.isOverControlPoint(x, y, targetSize, noHandles);
    }
    flipEW(mid) {
        this.path.flipEW(mid);
    }
    flipNS(mid) {
        this.path.flipNS(mid);
    }
    rotate(angle, about) {
        // debug('\n Shape.rotate - START');
        about = about || this.getCenter();
        this.path.rotate(angle, about);
        // debug('\t first p[0].p.x ' + this.path.pathPoints[0].p.x);
        // debug(' Shape.rotate - END\n');
    }
    getCenter() {
        let m = this.getMaxes();
        let re = {};
        re.x = ((m.xMax - m.xMin) / 2) + m.xMin;
        re.y = ((m.yMax - m.yMin) / 2) + m.yMin;
        return re;
    }
    reverseWinding() {
        this.path.reverseWinding();
    }
    getMaxes() {
        return this.path.maxes;
    }
    calcMaxes() {
        this.path.calcMaxes();
    }
    getPath() {
        return clone(this.path);
    }
    getSegment(num) {
        return this.path.getSegment(num);
    }
    resolveSelfOverlaps() {
        // debug('\n Shape.resolveSelfOverlaps - START');
        // Add self intersects to path
        let polyseg = this.path.getPolySegment();
        let ix = polyseg.findIntersections();
        // debug('\t intersections');
        // debug(json(ix, true));
        if (ix.length === 0)
            return new Shape(clone(this));
        let segnum = polyseg.segments.length;
        let threshold = 0.01;
        polyseg.splitSegmentsAtIntersections(ix, threshold);
        if (segnum === polyseg.segments.length)
            return new Shape(clone(this));
        // debug('\t before filtering ' + polyseg.segments.length);
        polyseg.removeZeroLengthSegments();
        polyseg.removeDuplicateSegments();
        polyseg.removeSegmentsOverlappingShape(this);
        polyseg.removeRedundantSegments();
        polyseg.removeNonConnectingSegments();
        // polyseg.combineInlineSegments();
        // debug('\t afters filtering ' + polyseg.segments.length);
        if (_UI.devMode)
            polyseg.drawPolySegmentOutline();
        // var reshapes = [];
        // reshapes.push(new Shape({'name':this.name, 'path':polyseg.getPath()}));
        let resegs = polyseg.stitchSegmentsTogether();
        let reshapes = [];
        let psn;
        for (let ps = 0; ps < resegs.length; ps++) {
            psn = resegs[ps];
            if (psn.segments.length > 1)
                reshapes.push(new Shape({ 'name': this.name, 'path': psn.getPath() }));
        }
        // debug(' Shape.resolveSelfOverlaps - END\n');
        return reshapes;
    }
    // -------------------------------------------------------------------------
    // CANVAS HELPER FUNCTIONS
    // -------------------------------------------------------------------------
    isHere(px, py) {
        return this.path.isHere(px, py);
    }
    isOverBoundingBoxHandle(px, py) {
        // debug('\n Shape.isOverBoundingBoxHandle - START');
        let c = isOverBoundingBoxHandle(px, py, this.path.maxes);
        // debug('\t Shape.isOverBoundingBoxHandle returning ' + c);
        return c;
    }
    changeShapeName(sn) {
        // debug('\n Shape.changeShapeName - START');
        // debug('\t passed: ' + sn);
        sn = strSan(sn);
        // debug('\t sanitized: ' + sn);
        if (sn !== '') {
            this.name = sn;
            history_put('shape name');
        }
        else {
            showToast('Invalid shape name - shape names must only contain alphanumeric characters or spaces.');
        }
        redraw({ calledBy: 'Shape Name', redrawCanvas: false });
        // debug(' Shape.changeShapeName - END\n');
    }
    // --------------------------------------------------------------
    // HELPER FUNCTIONS
    // ---------------------------------------------------------------
    checkPath() {
        // debug('CHECKPATH - checking ' + this.name + '\n' + JSON.stringify(this.path));
        for (let pp = 0; pp < this.path.pathPoints.length; pp++) {
            let tp = this.path.pathPoints[pp];
            if (!(tp.p.x))
                debug(this.name + ' p' + pp + '.p.x is ' + tp.p.x);
            if (!(tp.p.y))
                debug(this.name + ' p' + pp + '.p.y is ' + tp.p.y);
            if (!(tp.h1.x))
                debug(this.name + ' p' + pp + '.h1.x is ' + tp.h1.x);
            if (!(tp.h1.y))
                debug(this.name + ' p' + pp + '.h1.y is ' + tp.h1.y);
            if (!(tp.h2.x))
                debug(this.name + ' p' + pp + '.h2.x is ' + tp.h2.x);
            if (!(tp.h2.y))
                debug(this.name + ' p' + pp + '.h2.y is ' + tp.h2.y);
        }
    }
    checkForNaN() {
        return this.path.checkForNaN();
    }
    drawSegments() {
        let segs = this.path.getPolySegment();
        segs.slowlyDrawSegments();
    }
}





// ----------------------------------------------------------------------------------
//    DRAWING THE SHAPE
// ----------------------------------------------------------------------------------

    Shape.prototype.getName = function() {
 return this.name;
};


























// ----------------------------------------------------------------------------------
//    NEW SHAPE FUNCTIONS
// ----------------------------------------------------------------------------------
    function rectPathFromMaxes(maxes) {
        // Default Shape size
        let lx = 0;
        let ty = _GP.projectSettings.ascent;
        let rx = (_GP.projectSettings.upm / _GP.projectSettings.griddivisions);
        let by = 0;

        if (maxes) {
            lx = maxes.xMin;
            ty = maxes.yMax;
            rx = maxes.xMax;
            by = maxes.yMin;
        }

        let qw = round((rx-lx)/4);
        let qh = round((ty-by)/4);

        // First Point
        let Pul = new Coord({'x': lx, 'y': ty});
        let H1ul = new Coord({'x': lx, 'y': (ty-qh)});
        let H2ul = new Coord({'x': (lx+qw), 'y': ty});

        // Second Point
        let Pur = new Coord({'x': rx, 'y': ty});
        let H1ur = new Coord({'x': (rx-qw), 'y': ty});
        let H2ur = new Coord({'x': rx, 'y': (ty-qh)});

        // Third Point
        let Plr = new Coord({'x': rx, 'y': by});
        let H1lr = new Coord({'x': rx, 'y': (by+qh)});
        let H2lr = new Coord({'x': (rx-qw), 'y': by});

        // Fourth Point
        let Pll = new Coord({'x': lx, 'y': by});
        let H1ll = new Coord({'x': (lx+qw), 'y': by});
        let H2ll = new Coord({'x': lx, 'y': (by+qh)});

        let patharr = [];
        patharr[0] = new PathPoint({'p': Pul, 'h1': H1ul, 'h2': H2ul});
        patharr[1] = new PathPoint({'p': Pur, 'h1': H1ur, 'h2': H2ur});
        patharr[2] = new PathPoint({'p': Plr, 'h1': H1lr, 'h2': H2lr});
        patharr[3] = new PathPoint({'p': Pll, 'h1': H1ll, 'h2': H2ll});

        let rp = new Path({pathPoints: patharr, 'leftx': lx, 'rightx': rx, 'topy': ty, 'bottomy': by});
        // debug('RETURNING PATH: ' + JSON.stringify(rp));

        return rp;
    }

    function ovalPathFromMaxes(maxes) {
        maxes = maxes || {};

        // Default Circle size
        lx = isVal(maxes.xMin)? maxes.xMin : 0;
        ty = isVal(maxes.yMax)? maxes.yMax : _GP.projectSettings.xheight || 500;
        rx = isVal(maxes.xMax)? maxes.xMax : _GP.projectSettings.xheight || 500;
        by = isVal(maxes.yMin)? maxes.yMin : 0;


        let hw = round((rx-lx)/2);
        let hh = round((ty-by)/2);
        let hwd = round(hw*0.448);
        let hhd = round(hh*0.448);

        // First Point - Top
        let Pt = new Coord({'x': (lx+hw), 'y': ty});
        let H1t = new Coord({'x': (lx+hwd), 'y': ty});
        let H2t = new Coord({'x': (rx-hwd), 'y': ty});

        // Second Point - Right
        let Pr = new Coord({'x': rx, 'y': (by+hh)});
        let H1r = new Coord({'x': rx, 'y': (ty-hhd)});
        let H2r = new Coord({'x': rx, 'y': (by-hhd)});

        // Third Point - Bottom
        let Pb = new Coord({'x': (lx+hw), 'y': by});
        let H1b = new Coord({'x': (rx-hwd), 'y': by});
        let H2b = new Coord({'x': (lx+hwd), 'y': by});

        // Fourth Point - Left
        let Pl = new Coord({'x': lx, 'y': (by+hh)});
        let H1l = new Coord({'x': lx, 'y': (by+hhd)});
        let H2l = new Coord({'x': lx, 'y': (ty-hhd)});

        let patharr = [];
        patharr[0] = new PathPoint({'p': Pt, 'h1': H1t, 'h2': H2t, 'type': 'symmetric'});
        patharr[1] = new PathPoint({'p': Pr, 'h1': H1r, 'h2': H2r, 'type': 'symmetric'});
        patharr[2] = new PathPoint({'p': Pb, 'h1': H1b, 'h2': H2b, 'type': 'symmetric'});
        patharr[3] = new PathPoint({'p': Pl, 'h1': H1l, 'h2': H2l, 'type': 'symmetric'});

        return new Path({pathPoints: patharr});
    }


//    -----------------
//    Button Functions
//    -----------------
    function addShape(newshape) {
        // debug('addShape - START');
        // debug('\t name: ' + newshape.name);
        // debug('\t objType: ' + newshape.objType);

        if (newshape) {
            if (newshape.objType === 'componentinstance') {
                // debug('\t is a Component instance');
                _UI.selectedTool = 'shaperesize';
            } else if (newshape.path && (_UI.selectedTool === 'shaperesize')) {
                // debug('\t triggered as true: newshape.path && _UI.selectedTool == shaperesize \n\t NOT calling calcmaxes, okay?');
                // newshape.calcMaxes();
            }
        } else {
            // debug('\t passed null, creating new shape.');
            newshape = new Shape({});
            newshape.name = ('Rectangle ' + ((getSelectedWorkItemShapes().length*1)+1));
        }

        let sg = getSelectedWorkItem();

        sg.shapes.push(newshape);
        _UI.multiSelect.shapes.select(newshape);
        sg.changed();

        _UI.currentPanel = 'npAttributes';

        // debug('\t returns: ' + newshape.name);
        // debug('addShape - END\n');
        return newshape;
    }

    function addBasicShape(type) {
        let hd = 50;
        let th = 500;
        let tw = 300;
        let newshape = new Shape({});
        let parr = false;
        let shapetype = 'Shape ';
        let p1, p2, p3, p4;

        if (type === 'oval') {
            p1 = new PathPoint({'p': new Coord({'x': 0, 'y': (th/2)}), 'h1': new Coord({'x': 0, 'y': hd}), 'h2': new Coord({'x': 0, 'y': (th-hd)}), 'type': 'symmetric'});
            p2 = new PathPoint({'p': new Coord({'x': (tw/2), 'y': th}), 'h1': new Coord({'x': hd, 'y': th}), 'h2': new Coord({'x': (tw-hd), 'y': th}), 'type': 'symmetric'});
            p3 = new PathPoint({'p': new Coord({'x': tw, 'y': (th/2)}), 'h1': new Coord({'x': tw, 'y': (th-hd)}), 'h2': new Coord({'x': tw, 'y': hd}), 'type': 'symmetric'});
            p4 = new PathPoint({'p': new Coord({'x': (tw/2), 'y': 0}), 'h1': new Coord({'x': (tw-hd), 'y': 0}), 'h2': new Coord({'x': hd, 'y': 0}), 'type': 'symmetric'});
            parr = [p1, p2, p3, p4];
            shapetype = 'Oval ';
        } else {
            p1 = new PathPoint({'p': new Coord({'x': 0, 'y': 0}), 'h1': new Coord({'x': hd, 'y': 0}), 'h2': new Coord({'x': 0, 'y': hd})});
            p2 = new PathPoint({'p': new Coord({'x': 0, 'y': th}), 'h1': new Coord({'x': 0, 'y': (th-hd)}), 'h2': new Coord({'x': hd, 'y': th})});
            p3 = new PathPoint({'p': new Coord({'x': tw, 'y': th}), 'h1': new Coord({'x': (tw-hd), 'y': th}), 'h2': new Coord({'x': tw, 'y': (th-hd)})});
            p4 = new PathPoint({'p': new Coord({'x': tw, 'y': 0}), 'h1': new Coord({'x': tw, 'y': hd}), 'h2': new Coord({'x': (tw-hd), 'y': 0})});
            parr = [p1, p2, p3, p4];
            shapetype = 'Rectangle ';
        }

        newshape.path = new Path({pathPoints: parr});
        newshape.name = (shapetype + getSelectedWorkItemShapes().length+1);

        getSelectedWorkItemShapes().push(newshape);
        _UI.multiSelect.shapes.select(newshape);
        updateCurrentGlyphWidth();
    }

    function turnSelectedShapeIntoAComponent() {
        let s = clone(_UI.multiSelect.shapes.getMembers());
        let n = s.length === 1? ('Component ' + s[0].name) : ('Component ' + (countObjectKeys(_GP.components)+1));

        _UI.multiSelect.shapes.deleteShapes();
        let newid = createNewComponent(new Glyph({'shapes': s, 'name': n}));
        insertComponentInstance(newid);
        _UI.selectedTool = 'shaperesize';
        selectShape(getSelectedWorkItemShapes().length-1);
        redraw({calledBy: 'turnSelectedShapeIntoAComponent'});
    }

    function getClickedShape(x, y) {
        // debug('\n getClickedShape - START');
        // debug('\t checking x:' + x + ' y:' + y);

        let ts;
        let sws = getSelectedWorkItemShapes();
        for (let j=(sws.length-1); j>=0; j--) {
            ts = sws[j];
            // debug('\t Checking shape ' + j);

            if (ts.isHere(x, y)) {
                return ts;
            }
        }

        // clickEmptySpace();
        // debug(' getClickedShape - END\n');
        return false;
    }

    function isOverShape(x, y) {
        let sws = getSelectedWorkItemShapes();
        for (let j=(sws.length-1); j>=0; j--) {
            if (sws[j].isHere(x, y)) return true;
        }
        return false;
    }


//    -----------------
//    Boolean Combine
//    -----------------

    function combineShapes(shapes, donttoast, dontresolveoverlaps) {
        // debug('\n combineShapes - START');
        // debug(shapes);

        let tempshapes = false;

        if (shapes.length <= 1) {
            // debug('\t length=1 - returning what was passed');
            return false;
        } else if (shapes.length === 2) {
            tempshapes = combineTwoShapes(shapes[0], shapes[1], donttoast);
            if (!tempshapes) {
                // debug('\t length=2 - returning what was passed');
                if (!donttoast) showToast('The selected shapes do not have overlapping paths.');
                return false;
            } else {
                tempshapes = [tempshapes];
                // debug('\t length=2 - continuing with tempshapes from combineTwoShapes');
                // debug(tempshapes);
            }
        }


        // One pass through collapsing shapes down
        function singlePass(arr) {
            // debug('\n\t SinglePass');
            // debug('\t\t start arr len ' + arr.length);
            let re;
            let newarr = [];
            let didstuff = false;

            for (let outer=0; outer<arr.length; outer++) {
 for (let inner=0; inner<arr.length; inner++) {
                // debug('\t\t testing shape ' + outer + ' and ' + inner);

                if ((outer !== inner) && arr[outer] && arr[inner]) {
                    re = combineTwoShapes(arr[outer], arr[inner], donttoast);

                    // debug('\t\t combineShapes returned ' + (re.length || re));
                    if (re !== false) {
                        newarr.push(re);
                        didstuff = true;
                        arr[outer] = false;
                        arr[inner] = false;
                    }
                }
            }
}

            newarr = newarr.concat(arr.filter(function(v) {
return v;
}));

            // debug('\t singlepass didstuff = ' + didstuff);

            return {'arr': newarr, 'didstuff': didstuff};
        }


        // Sort shapes by winding

        if (!tempshapes) {
            tempshapes = clone(shapes);
            tempshapes.sort(function(a, b) {
return a.path.winding - b.path.winding;
});

            // Main collapsing loop
            let looping = true;
            let count = 0;

            while (looping && count < 20) {
                looping = false;

                lr = singlePass(tempshapes);
                looping = lr.didstuff;
                if (!looping && count === 0) {
                    if (!donttoast) showToast('The selected shapes do not have overlapping paths.');
                    return false;
                }

                tempshapes = lr.arr;
                // debug('\t didstuff ' + lr.didstuff);
                count++;
            }
        }


        // debug(tempshapes);

        let newshapes = [];
        if (dontresolveoverlaps) {
            // debug('\t dontresolveoverlaps is true');
            newshapes = tempshapes;
            // debug('\t newshapes is now ');
            // debug(newshapes);
        } else {
            // debug('\t dontresolveoverlaps is false, tempshapes.length = ' + tempshapes.length);
            // Collapse each shape's overlapping paths
            for (let ts=0; ts<tempshapes.length; ts++) {
                newshapes = newshapes.concat(tempshapes[ts].resolveSelfOverlaps());
            }
            // debug('\t newshapes is now ');
            // debug(newshapes);
        }

        // debug('\t returning');
        // debug(newshapes);

        // debug(' combineShapes - END\n');
        return newshapes;
    }

    function combineTwoShapes(shape1, shape2) {
        // debug('\n combineShapes - START');
        // Find intersections
        let intersections = findPathIntersections(shape1.path, shape2.path);

        if (intersections.length < 1) {
            // debug('\t no intersections, returning.');
            return false;
        }

        // Insert one intersection into both shapes
        let ix = ixToCoord(intersections[0]);

        let p1 = shape1.path.containsPoint(ix);
        if (!p1) {
            p1 = shape1.path.getClosestPointOnCurve(ix);
            p1 = shape1.path.insertPathPoint(p1.split, p1.point);
        }
        p1.customid = 'overlap';

        let p2 = shape2.path.containsPoint(ix);
        if (!p2) {
            p2 = shape2.path.getClosestPointOnCurve(ix);
            p2 = shape2.path.insertPathPoint(p2.split, p2.point);
        }
        p2.customid = 'overlap';


        // Walk one shape until the overlap point is found
        // Flip to the other shape, add all the points
        // Flip back to the first shape, add remaining points

        function getPointsBeforeOverlap(path) {
            let re = [];
            let pt = {};

            for (let pp=0; pp<path.pathPoints.length; pp++) {
                pt = new PathPoint(path.pathPoints[pp]);

                if (path.pathPoints[pp].customid !== 'overlap') {
                    re.push(pt);
                } else {
                    return {
                        'points': re,
                        'overlap': pt,
                    };
                }
            }
        }

        function getPointsAfterOverlap(path) {
            let re = [];
            let ov = {};

            for (let pp=0; pp<path.pathPoints.length; pp++) {
                if (path.pathPoints[pp].customid === 'overlap') {
                    ov = new PathPoint(path.pathPoints[pp]);

                    for (let pa=(pp+1); pa<path.pathPoints.length; pa++) {
                        re.push(new PathPoint(path.pathPoints[pa]));
                    }

                    return {
                        'points': re,
                        'overlap': ov,
                    };
                }
            }
        }

        let s1h1 = getPointsBeforeOverlap(shape1.path);
        let s1h2 = getPointsAfterOverlap(shape1.path);
        let s2h1 = getPointsBeforeOverlap(shape2.path);
        let s2h2 = getPointsAfterOverlap(shape2.path);

        let newpoints = [];

        newpoints = newpoints.concat(s1h1.points);

        newpoints.push(
            new PathPoint({
                p: clone(s1h1.overlap.p),
                h1: clone(s1h1.overlap.h1),
                h2: clone(s2h1.overlap.h2),
                type: 'corner',
            })
        );

        newpoints = newpoints.concat(s2h2.points);
        newpoints = newpoints.concat(s2h1.points);

        newpoints.push(
            new PathPoint({
                P: clone(s2h1.overlap.p),
                H1: clone(s2h1.overlap.h1),
                H2: clone(s1h2.overlap.h2),
                type: 'corner',
            })
        );

        newpoints = newpoints.concat(s1h2.points);

        // debug(' combineShapes - returning successfully - END\n');

        return new Shape({path: {pathPoints: newpoints}});
    }
