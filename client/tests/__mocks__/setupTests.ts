import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-preact-pure';

configure({
    adapter: new Adapter()
});

window.matchMedia = window.matchMedia || function() {
    return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
    };
};