import {makeElement} from '../controls/controls.js';

/**
 * Page > Glyph Edit
 * The main edit surface for Glyphr Studio
 * Comprised of Panels of tools, and the Edit Canvas
 */
export default class PageGlyphEdit {
    /**
     * Initialize this page
     */
    constructor() {}

    /**
     * Load the Open Project page
     * @returns {object} HTML Element + callback function
     */
    pageLoader() {
        debug(`\n PageGlyphEdit.pageLoader - START`);

        let content = makeElement({tag: 'div', id: 'pageWrapper', innerHTML: `
            <div class="glyphEdit">
                <div class="glyphEditLeftArea">
                    <fancy-button>Glyphr Studio</fancy-button>
                    <panel-area panel="attributes"></panel-area>
                </div>
                <div class="glyphEditRightArea">
                    <canvas-display glyphs="A"></canvas-display>
                </div>
            </div>
        `});

        let callback = function() {
            let can = document.querySelector('canvas-display');
            can.redraw();
            debug(` PageGlyphEdit.pageLoader.callback - END\n\n`);
        };

        debug(` PageGlyphEdit.pageLoader - END\n\n`);

        return {content: content, callback: callback};
    }
}

/*
    function loadPage_glyphedit() {
        // debug('\n loadPage_glyphedit - START');

        getEditDocument().getElementById('mainwrapper').innerHTML = editPage_Content();
        setupEditCanvas();
        initEventHandlers();
        clickEmptySpace();

        if (window.GlyphrStudio.settings.dev.mode && isVal(window.GlyphrStudio.settings.dev.selectedShape)) {
            selectShape(window.GlyphrStudio.settings.dev.selectedShape);
            window.GlyphrStudio.settings.dev.selectedShape = false;
        }

        _UI.selectedGlyph = _UI.selectedGlyph || getFirstGlyphID();

        if (getSelectedWorkItemShapes().length > 0) {
            if (_UI.selectedTool !== 'shaperesize') _UI.selectedTool = 'pathedit';
        } else _UI.selectedTool = 'pathaddpoint';

        redraw({calledBy: 'loadPage_glyphedit'});

        // debug(' loadPage_glyphedit - END\n');
    }


// -------------------
// Redraw
// -------------------
    function redraw_GlyphEdit() {
        // debug('\n redraw_GlyphEdit - START');
        _UI.redrawing = true;

        let sg = getSelectedWorkItem();
        let editmode = getEditMode();

        // if (sg) sg.calcMaxes();
        // debug('\t Selected WI ' + sg.name);

        // draw grids
        drawGrid();
        drawGuides();

        // load glyph info
        if (sg && sg.shapes.length) {
            let v = getView('Redraw');
            if (sg.contextGlyphs) drawContextGlyphs();
            sg.drawGlyph(_UI.glyphEditCTX, v);
        } else {
            _UI.redrawing = false;
            return;
        }

        _UI.multiSelect.shapes.draw_PathOutline();

        if (editmode === 'arrow') {
            _UI.multiSelect.shapes.draw_BoundingBox();
            _UI.multiSelect.shapes.draw_BoundingBoxHandles();
        } else if (editmode === 'rotate') {
            _UI.multiSelect.shapes.draw_RotationAffordance();
        } else if (editmode === 'pen') {
            if (_UI.eventhandlers.multi) sg.drawMultiSelectAffordances(_UI.colors.blue);
            _UI.multiSelect.points.draw_PathPointHandles();
            _UI.multiSelect.shapes.draw_PathPoints();
            // _UI.multiSelect.points.draw_PathPoints();

            if (_UI.eventhandlers.hoverpoint) {
                let hp = _UI.eventhandlers.hoverpoint;
                _UI.glyphEditCTX.fillStyle = hp.fill;
                _UI.glyphEditCTX.fillRect(hp.x, hp.y, hp.size, hp.size);
            }
        } else if (editmode === 'newpath') {
            _UI.multiSelect.points.draw_PathPointHandles();
            _UI.multiSelect.shapes.draw_PathPoints();
            // _UI.multiSelect.points.draw_PathPoints();
        }

        _UI.redrawing = false;
        // debug(' redraw_GlyphEdit - END\n');
    }
*/
