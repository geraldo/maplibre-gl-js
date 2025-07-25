import {describe, beforeEach, test, expect, vi} from 'vitest';
import {extend} from '../../util/util';
import {Map} from '../map';
import {DOM} from '../../util/dom';
import simulate from '../../../test/unit/lib/simulate_interaction';
import {browser} from '../../util/browser';

import {beforeMapTest} from '../../util/test/util';

function createMap(options?) {
    return new Map(extend({container: DOM.create('div', '', window.document.body)}, options));
}

beforeEach(() => {
    beforeMapTest();
});

describe('drag rotate', () => {

    test('DragRotateHandler.isActive', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        expect(map.dragRotate.isActive()).toBe(false);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        map._renderTaskQueue.run();
        expect(map.dragRotate.isActive()).toBe(false);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(map.dragRotate.isActive()).toBe(true);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(map.dragRotate.isActive()).toBe(false);

        map.remove();
    });

    test('DragRotateHandler fires rotatestart, rotate, and rotateend events at appropriate times in response to a right-click drag', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 200, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler fires rollstart, roll, and rollend events at appropriate times in response to a Ctrl-right-click drag', () => {
        const map = createMap({rollEnabled: true});

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rollstart = vi.fn();
        const roll      = vi.fn();
        const rollend   = vi.fn();

        map.on('rollstart', rollstart);
        map.on('roll',      roll);
        map.on('rollend',   rollend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2, ctrlKey: true});
        map._renderTaskQueue.run();
        expect(rollstart).toHaveBeenCalledTimes(0);
        expect(roll).toHaveBeenCalledTimes(0);
        expect(rollend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rollstart).toHaveBeenCalledTimes(1);
        expect(roll).toHaveBeenCalledTimes(1);
        expect(rollend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(rollstart).toHaveBeenCalledTimes(1);
        expect(roll).toHaveBeenCalledTimes(1);
        expect(rollend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler stops firing events after mouseup', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const spy = vi.fn();
        map.on('rotatestart', spy);
        map.on('rotate',      spy);
        map.on('rotateend',   spy);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 200, clientY: 10});
        map._renderTaskQueue.run();
        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(spy).toHaveBeenCalledTimes(3);

        spy.mockReset();
        simulate.mousemove(map.getCanvas(), {buttons: 0, clientX: 20, clientY: 20});
        map._renderTaskQueue.run();
        expect(spy).toHaveBeenCalledTimes(0);

        map.remove();
    });

    test('DragRotateHandler fires rotatestart, rotate, and rotateend events at appropriate times in response to a control-left-click drag', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 1, button: 0, ctrlKey: true});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 1,            ctrlKey: true, clientX: 200, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 0, ctrlKey: true});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler pitches in response to a right-click drag by default', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const pitchstart = vi.fn();
        const pitch      = vi.fn();
        const pitchend   = vi.fn();

        map.on('pitchstart', pitchstart);
        map.on('pitch',      pitch);
        map.on('pitchend',   pitchend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: -10});
        map._renderTaskQueue.run();
        expect(pitchstart).toHaveBeenCalledTimes(1);
        expect(pitch).toHaveBeenCalledTimes(1);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(pitchend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler doesn\'t fire pitch event when rotating only', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const pitchstart = vi.fn();
        const pitch      = vi.fn();
        const pitchend   = vi.fn();

        map.on('pitchstart', pitchstart);
        map.on('pitch',      pitch);
        map.on('pitchend',   pitchend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2, clientX: 0, clientY: 10});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(pitchstart).toHaveBeenCalledTimes(0);
        expect(pitch).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        expect(pitchend).toHaveBeenCalledTimes(0);

        map.remove();
    });

    test('DragRotateHandler pitches in response to a control-left-click drag', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const pitchstart = vi.fn();
        const pitch      = vi.fn();
        const pitchend   = vi.fn();

        map.on('pitchstart', pitchstart);
        map.on('pitch',      pitch);
        map.on('pitchend',   pitchend);

        simulate.mousedown(map.getCanvas(), {buttons: 1, button: 0, ctrlKey: true});
        simulate.mousemove(map.getCanvas(), {buttons: 1,            ctrlKey: true, clientX: 10, clientY: -10});
        map._renderTaskQueue.run();
        expect(pitchstart).toHaveBeenCalledTimes(1);
        expect(pitch).toHaveBeenCalledTimes(1);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 0, ctrlKey: true});
        map._renderTaskQueue.run();
        expect(pitchend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler does not pitch if given pitchWithRotate: false', () => {
        const map = createMap({pitchWithRotate: false});

        const spy = vi.fn();

        map.on('pitchstart',  spy);
        map.on('pitch',       spy);
        map.on('pitchend',    spy);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});

        simulate.mousedown(map.getCanvas(), {buttons: 1, button: 0, ctrlKey: true});
        simulate.mousemove(map.getCanvas(), {buttons: 1,            ctrlKey: true, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 0, ctrlKey: true});

        expect(spy).not.toHaveBeenCalled();

        map.remove();
    });

    test('DragRotateHandler does not rotate or pitch when disabled', () => {
        const map = createMap();

        map.dragRotate.disable();

        const spy = vi.fn();

        map.on('rotatestart', spy);
        map.on('rotate',      spy);
        map.on('rotateend',   spy);
        map.on('pitchstart',  spy);
        map.on('pitch',       spy);
        map.on('pitchend',    spy);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});

        expect(spy).not.toHaveBeenCalled();

        map.remove();
    });

    test('DragRotateHandler ensures that map.isMoving() returns true during drag', () => {
    // The bearingSnap option here ensures that the moveend event is sent synchronously.
        const map = createMap({bearingSnap: 0});

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(map.isMoving()).toBeTruthy();

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(!map.isMoving()).toBeTruthy();

        map.remove();
    });

    test('DragRotateHandler fires move events', () => {
    // The bearingSnap option here ensures that the moveend event is sent synchronously.
        const map = createMap({bearingSnap: 0});

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const movestart = vi.fn();
        const move      = vi.fn();
        const moveend   = vi.fn();

        map.on('movestart', movestart);
        map.on('move',      move);
        map.on('moveend',   moveend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(movestart).toHaveBeenCalledTimes(1);
        expect(move).toHaveBeenCalledTimes(1);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(moveend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler doesn\'t fire rotate event when pitching only', () => {
    // The bearingSnap option here ensures that the moveend event is sent synchronously.
        const map = createMap({bearingSnap: 0});

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const pitch       = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',    rotate);
        map.on('pitch',     pitch);
        map.on('rotateend', rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2, clientX: 0, clientY: 0});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 0, clientY: -10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(pitch).toHaveBeenCalledTimes(1);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        expect(rotateend).toHaveBeenCalledTimes(0);

        map.remove();
    });

    test('DragRotateHandler includes originalEvent property in triggered events', () => {
    // The bearingSnap option here ensures that the moveend event is sent synchronously.
        const map = createMap({bearingSnap: 0});

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();
        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        const pitchstart = vi.fn();
        const pitch      = vi.fn();
        const pitchend   = vi.fn();
        map.on('pitchstart', pitchstart);
        map.on('pitch',      pitch);
        map.on('pitchend',   pitchend);

        const movestart = vi.fn();
        const move      = vi.fn();
        const moveend   = vi.fn();
        map.on('movestart', movestart);
        map.on('move',      move);
        map.on('moveend',   moveend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: -10});
        map._renderTaskQueue.run();
        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();

        expect(rotatestart.mock.calls[0][0].originalEvent.type).toBeTruthy();
        expect(pitchstart.mock.calls[0][0].originalEvent.type).toBeTruthy();
        expect(movestart.mock.calls[0][0].originalEvent.type).toBeTruthy();

        expect(rotate.mock.calls[0][0].originalEvent.type).toBeTruthy();
        expect(pitch.mock.calls[0][0].originalEvent.type).toBeTruthy();
        expect(move.mock.calls[0][0].originalEvent.type).toBeTruthy();

        expect(rotateend.mock.calls[0][0].originalEvent.type).toBeTruthy();
        expect(pitchend.mock.calls[0][0].originalEvent.type).toBeTruthy();
        expect(moveend.mock.calls[0][0].originalEvent.type).toBeTruthy();

        map.remove();
    });

    test('DragRotateHandler responds to events on the canvas container (#1301)', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvasContainer(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvasContainer(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);

        simulate.mouseup(map.getCanvasContainer(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler prevents mousemove events from firing during a drag (#1555)', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const mousemove = vi.fn();
        map.on('mousemove', mousemove);

        simulate.mousedown(map.getCanvasContainer(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvasContainer(), {buttons: 2, clientX: 100, clientY: 100});
        map._renderTaskQueue.run();
        simulate.mouseup(map.getCanvasContainer(),   {buttons: 0, button: 2});

        expect(mousemove).not.toHaveBeenCalled();

        map.remove();
    });

    test('DragRotateHandler ends a control-left-click drag on mouseup even when the control key was previously released (#1888)', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 1, button: 0, ctrlKey: true});
        simulate.mousemove(map.getCanvas(), {buttons: 1,            ctrlKey: true, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 0, ctrlKey: false});
        map._renderTaskQueue.run();
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler ends rotation if the window blurs (#3389)', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);

        simulate.blur(window);
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler requests a new render frame after each mousemove event', () => {
        const map = createMap();
        const requestRenderFrame = vi.spyOn(map.handlers, '_requestFrame');

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        expect(requestRenderFrame).toHaveBeenCalled();

        map._renderTaskQueue.run();

        // https://github.com/mapbox/mapbox-gl-js/issues/6063
        requestRenderFrame.mockReset();
        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 20, clientY: 20});
        expect(requestRenderFrame).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler can interleave with another handler', () => {
    // https://github.com/mapbox/mapbox-gl-js/issues/6106
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        // simulates another handler taking over
        // simulate a scroll zoom
        simulate.wheel(map.getCanvas(), {type: 'wheel', deltaY: -simulate.magicWheelZoomDelta});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 20, clientY: 20});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(2);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        // Ignore second rotatestart triggered by inertia
        expect(rotate).toHaveBeenCalledTimes(2);
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler does not begin a drag on left-button mousedown without the control key', () => {
        const map = createMap();
        map.dragPan.disable();

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas());
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas());
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        map.remove();
    });

    test('DragRotateHandler does not end a right-button drag on left-button mouseup', () => {
        const map = createMap();
        map.dragPan.disable();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousedown(map.getCanvas(), {buttons: 3, button: 0});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 2, button: 0});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 20, clientY: 20});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(2);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();
        // Ignore second rotatestart triggered by inertia
        expect(rotate).toHaveBeenCalledTimes(2);
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler does not end a control-left-button drag on right-button mouseup', () => {
        const map = createMap();
        map.dragPan.disable();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 1, button: 0, ctrlKey: true});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 1,            ctrlKey: true, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousedown(map.getCanvas(), {buttons: 3, button: 2, ctrlKey: true});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 1, button: 2, ctrlKey: true});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 1,            ctrlKey: true, clientX: 20, clientY: 20});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(2);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 0, ctrlKey: true});
        map._renderTaskQueue.run();
        // Ignore second rotatestart triggered by inertia
        expect(rotate).toHaveBeenCalledTimes(2);
        expect(rotateend).toHaveBeenCalledTimes(1);

        map.remove();
    });

    test('DragRotateHandler does not begin a drag if preventDefault is called on the mousedown event', () => {
        const map = createMap();

        map.on('mousedown', e => e.preventDefault());

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        map._renderTaskQueue.run();

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2});
        map._renderTaskQueue.run();

        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        map.remove();
    });

    test('DragRotateHandler can be disabled after mousedown (#2419)', () => {
        const map = createMap();

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2});
        map._renderTaskQueue.run();

        map.dragRotate.disable();

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();

        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);
        expect(map.isMoving()).toBe(false);
        expect(map.dragRotate.isEnabled()).toBe(false);

        simulate.mouseup(map.getCanvas(), {buttons: 0, button: 2});
        map._renderTaskQueue.run();

        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);
        expect(map.isMoving()).toBe(false);
        expect(map.dragRotate.isEnabled()).toBe(false);

        map.remove();
    });

    test('DragRotateHandler does not begin rotation on spurious mousemove events', () => {
        const map = createMap();

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        simulate.mouseup(map.getCanvas(),   {buttons: 0, button: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);

        map.remove();
    });

    test('DragRotateHandler does not begin a mouse drag if moved less than click tolerance', () => {
        const map = createMap({clickTolerance: 4});

        // Prevent inertial rotation.
        vi.spyOn(browser, 'now').mockReturnValue(0);

        const rotatestart = vi.fn();
        const rotate      = vi.fn();
        const rotateend   = vi.fn();
        const pitchstart  = vi.fn();
        const pitch       = vi.fn();
        const pitchend    = vi.fn();

        map.on('rotatestart', rotatestart);
        map.on('rotate',      rotate);
        map.on('rotateend',   rotateend);
        map.on('pitchstart',  pitchstart);
        map.on('pitch',       pitch);
        map.on('pitchend',    pitchend);

        simulate.mousedown(map.getCanvas(), {buttons: 2, button: 2, clientX: 10, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);
        expect(pitchstart).toHaveBeenCalledTimes(0);
        expect(pitch).toHaveBeenCalledTimes(0);
        expect(pitchend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 13, clientY: 10});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);
        expect(pitchstart).toHaveBeenCalledTimes(0);
        expect(pitch).toHaveBeenCalledTimes(0);
        expect(pitchend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 10, clientY: 13});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(0);
        expect(rotate).toHaveBeenCalledTimes(0);
        expect(rotateend).toHaveBeenCalledTimes(0);
        expect(pitchstart).toHaveBeenCalledTimes(0);
        expect(pitch).toHaveBeenCalledTimes(0);
        expect(pitchend).toHaveBeenCalledTimes(0);

        simulate.mousemove(map.getCanvas(), {buttons: 2, clientX: 14, clientY: 10 - 4});
        map._renderTaskQueue.run();
        expect(rotatestart).toHaveBeenCalledTimes(1);
        expect(rotate).toHaveBeenCalledTimes(1);
        expect(rotateend).toHaveBeenCalledTimes(0);
        expect(pitchstart).toHaveBeenCalledTimes(1);
        expect(pitch).toHaveBeenCalledTimes(1);
        expect(pitchend).toHaveBeenCalledTimes(0);

        map.remove();
    });
});
