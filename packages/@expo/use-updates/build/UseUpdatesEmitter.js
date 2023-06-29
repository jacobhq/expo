import { DeviceEventEmitter } from 'expo-modules-core';
import { EventEmitter } from 'fbemitter';
import { useEffect, useRef } from 'react';
// Emitter and hook specifically for @expo/use-updates module
// Listens for the same native events as Updates.addListener
// Emits the native events (or allows JS code to emit events) with
// new event name 'Expo.useUpdatesEvent'
let _emitter;
function _getEmitter() {
    if (!_emitter) {
        _emitter = new EventEmitter();
        DeviceEventEmitter.addListener('Expo.nativeUpdatesStateChangeEvent', _emitNativeStateChangeEvent);
    }
    return _emitter;
}
function _addListener(listener) {
    const emitter = _getEmitter();
    return emitter.addListener('Expo.useUpdatesEvent', listener);
}
// Handle native state change events
function _emitNativeStateChangeEvent(params) {
    let newParams = { ...params };
    if (typeof params === 'string') {
        newParams = JSON.parse(params);
    }
    if (newParams.context.latestManifestString) {
        newParams.context.latestManifest = JSON.parse(newParams.context.latestManifestString);
        delete newParams.context.latestManifestString;
    }
    if (newParams.context.downloadedManifestString) {
        newParams.context.downloadedManifest = JSON.parse(newParams.context.downloadedManifestString);
        delete newParams.context.downloadedManifestString;
    }
    if (!_emitter) {
        throw new Error(`EventEmitter must be initialized to use from its listener`);
    }
    _emitter?.emit('Expo.updatesStateChangeEvent', newParams);
}
// What JS code uses to emit events
export const emitEvent = (event) => {
    if (!_emitter) {
        throw new Error(`EventEmitter must be initialized to use from its listener`);
    }
    _emitter.emit('Expo.useUpdatesEvent', event);
};
export const useUpdateEvents = (listener) => {
    const listenerRef = useRef();
    useEffect(() => {
        listenerRef.current = listener;
    }, [listener]);
    useEffect(() => {
        if (listenerRef.current) {
            const subscription = _addListener(listenerRef.current);
            return () => {
                subscription.remove();
            };
        }
        return undefined;
    }, []);
};
export const addUpdatesStateChangeListener = (listener) => {
    const emitter = _getEmitter();
    return emitter.addListener('Expo.updatesStateChangeEvent', listener);
};
//# sourceMappingURL=UseUpdatesEmitter.js.map