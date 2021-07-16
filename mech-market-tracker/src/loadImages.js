function importAll(r) {
    let images = {};
    r.keys().forEach((item) => { images[item.replace('./', '').replace(/\.[^/.]+$/, "")] = r(item); });
    return images;
}

const images = importAll(require.context('../gmk_images', false, /\.[^/.]+$/));

export default images;