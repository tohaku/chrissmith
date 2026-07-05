type colorScheme = 'light' | 'dark' | 'auto';

class StackColorScheme {
    private localStorageKey = 'StackColorScheme';
    private currentScheme: colorScheme;
    private systemPreferScheme: colorScheme;

    constructor(toggleEl: HTMLElement) {
        this.bindMatchMedia();
        this.currentScheme = this.getSavedScheme();
        if (window.matchMedia('(prefers-color-scheme: dark)').matches === true)
            this.systemPreferScheme = 'dark'
        else
            this.systemPreferScheme = 'light';

        this.dispatchEvent(document.documentElement.dataset.scheme as colorScheme);
        this.updateBackgroundImage();

        if (toggleEl)
            this.bindClick(toggleEl);

        if (document.body.style.transition == '')
            document.body.style.setProperty('transition', 'background-color .3s ease');
    }

    private saveScheme() {
        localStorage.setItem(this.localStorageKey, this.currentScheme);
    }

    private bindClick(toggleEl: HTMLElement) {
        toggleEl.addEventListener('click', (e) => {
            if (this.isDark()) {
                /// Disable dark mode
                this.currentScheme = 'light';
            }
            else {
                this.currentScheme = 'dark';
            }

            this.setBodyClass();

            if (this.currentScheme == this.systemPreferScheme) {
                /// Set to auto
                this.currentScheme = 'auto';
            }

            this.saveScheme();
        })
    }

    private isDark() {
        return (this.currentScheme == 'dark' || this.currentScheme == 'auto' && this.systemPreferScheme == 'dark');
    }

    private dispatchEvent(colorScheme: colorScheme) {
        const event = new CustomEvent('onColorSchemeChange', {
            detail: colorScheme
        });
        window.dispatchEvent(event);
    }

    private setBodyClass() {
        if (this.isDark()) {
            document.documentElement.dataset.scheme = 'dark';
        }
        else {
            document.documentElement.dataset.scheme = 'light';
        }

        this.updateBackgroundImage();
        this.dispatchEvent(document.documentElement.dataset.scheme as colorScheme);
    }

    private getSavedScheme(): colorScheme {
        const savedScheme = localStorage.getItem(this.localStorageKey);

        if (savedScheme == 'light' || savedScheme == 'dark' || savedScheme == 'auto') return savedScheme;
        else return 'auto';
    }

    private bindMatchMedia() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (e.matches) {
                this.systemPreferScheme = 'dark';
            }
            else {
                this.systemPreferScheme = 'light';
            }
            this.setBodyClass();
        });
    }

    private updateBackgroundImage() {
        if (!document.body) return;

        const scheme = document.documentElement.dataset.scheme === 'dark' ? 'dark' : 'light';
        const styles = getComputedStyle(document.documentElement);
        const lightImage = styles.getPropertyValue('--theme-switcher-background-light').trim();
        const darkImage = styles.getPropertyValue('--theme-switcher-background-dark').trim();
        const target = scheme === 'dark' ? darkImage : lightImage;
        const value = target && target !== 'none' ? target : 'none';

        document.body.style.backgroundImage = value;
        if (value !== 'none') {
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundRepeat = 'no-repeat';
            document.body.style.backgroundSize = 'cover';
            document.body.style.backgroundPosition = 'left bottom';
        } else {
            document.body.style.removeProperty('background-attachment');
            document.body.style.removeProperty('background-repeat');
            document.body.style.removeProperty('background-size');
            document.body.style.removeProperty('background-position');
        }
    }
}

export default StackColorScheme;
