import axios from "axios";
import {ExportedGlobalComposer, VueI18n} from "vue-i18n";
import {TableItem} from "../components/DataTable.vue";

export interface Displayable {
    readonly displayName: string;
}

export interface OrganizationData {
    id: string;
    name: string;
    crmNo: string | null;
}

export class DisplayableOrg implements OrganizationData, Displayable {
    id: string;
    name: string;
    crmNo: string | null;

    constructor(x: OrganizationData) {
        this.id = x.id;
        this.name = x.name;
        this.crmNo = x.crmNo;
    }

    get displayName() {
        return this.name + " " + this.crmNo
    }
}

export type AdminRole = "superAdmin" | "orgSuperAdmin" | "userAdmin"

/**
 * User displayed in DDC
 */
export interface UserData extends TableItem {
    id: string
    firstname: string
    lastname: string
    email: string
    adminRole: AdminRole | null
    syncFlag: boolean | null
    crmId: string | null
    orgRef: OrganizationData
}

export default {

    install: (app: any, options: any) => {

        // inject a globally available methods ------------

        /**
         * @returns {string} a parameter from an URL
         */
        app.config.globalProperties.$getUrlParam = (url: string | null, name: string) => {
            if (!url) return ''
            const idx = url.indexOf('?')
            if (idx > -1) url = url.substring(idx)
            return new URLSearchParams(url).get(name);
        }

        /**
         * changes the locale
         */
        app.config.globalProperties.$setLocale = (i18n: VueI18n, locale: string | null) => {
            if (locale) {
                const lang = toSupportedLocale(locale, 'en')
                console.log(`[$setLocale] locale:${locale} lang:${lang}`)
                i18n.locale = lang
                axios.defaults.headers.common['Accept-Language'] = lang
                document.querySelector('html')?.setAttribute('lang', lang)
            }
        }

        app.config.globalProperties.$setLocale1 = (locale: string | null) => { // TODO remove after test
            app.config.globalProperties.$setLocale(i18n, locale)
        }

        app.config.globalProperties.$arraySize = (a: any[]) => a ? a.length : 0

        app.config.globalProperties.$userDisplayName = (user: UserData) => user
            ? user.firstname + " " + user.lastname + " (" + user.email + ")"
            : "??"

        app.config.globalProperties.$orgDisplayName = (org: OrganizationData) => org.name + " " + org.crmNo;

    },

}

/**
 * this informs typescript about this functions
 */
declare module 'vue' {
    interface ComponentCustomProperties {
        $getUrlParam: (url: string | null, name: string) => string | null
        $setLocale: (i18n: VueI18n | ExportedGlobalComposer, locale: string | null) => void
        $setLocale1: (locale: string | null) => void // TODO remove after test
        $arraySize: (a: any[]) => number
        $userDisplayName: (user: UserData) => string
        $orgDisplayName: (org: OrganizationData) => string
    }
}