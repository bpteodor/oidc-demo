import {Popover} from 'bootstrap'

/**
 * popover directive
 *
 * @see https://vuejs.org/guide/reusability/custom-directives.html#directive-hooks
 *
 * @deprecated file not used
 */
export const popover = {

    mounted(el: HTMLElement | any, binding: any) {
        console.debug("[popover] mount", el.id, binding)

        el['data-bs-container'] = 'body';
        el['data-bs-toggle'] = 'popover';
        el['data-bs-content'] = 'test';
        el['data-bs-placement'] = binding.arg ? binding.arg : 'top';

        // save the component as an attribute of the html-element
        //el['popover_state'] =
        new Popover(el, {
            selector: '.popover',
            trigger: 'manual',
            content: 'cucubau'
        }).show();
    },

    updated(el: HTMLElement | any, binding: any) {
        console.debug("[popover] updated", el.id, binding.value)
        el['data-bs-content'] = binding.value
        //el['popover_state'].show()
        /*DATA[el.id].setContent({
            '.popover-body': binding.value
        })
        DATA[el.id].show()*/
        const comp = Popover.getOrCreateInstance(el)
        /*comp.setContent({  TODO starting with 5.2
            '.popover-header': 'another title',
            '.popover-body': 'binding.value',
        })*/
        //comp.show()
    },

    unmounted(el: HTMLElement | any) {
        console.debug("[popover] unmount", el.id)
        el['popover_state'] && el['popover_state'].dispose()
    }
}
