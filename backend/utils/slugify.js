// utils/slugify.js
const slugify = (text) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        + '-' + Date.now();

module.exports = slugify;
