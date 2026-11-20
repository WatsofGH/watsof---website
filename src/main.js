import { initHero } from './hero/hero.js';
import { initHeader } from './site/header.js';
import { initReveal } from './site/reveal.js';
import { initServices } from './site/services.js';
import { initWork } from './site/work.js';
import { initContact } from './site/contact.js';

const hero = document.querySelector('.hero');
if (hero) initHero(hero);
initHeader();
initReveal();
initServices();
initWork();
initContact();
