// 东北雨姐表情包图片列表
export const IMAGES = [
  "https://pics1.baidu.com/feed/eaf81a4c510fd9f9cd809b07a301673a2934a482.jpeg@f_auto?token=d5c4885692c1d12a100c56d840456355",
  "https://pics4.baidu.com/feed/574e9258d109b3de275107655e14ef8e810a4c08.jpeg@f_auto?token=d7fd03a8f967c0499c5dd8411c488b92",
  "https://ww1.sinaimg.cn/mw690/49898109gy1hu4qw04nexj20j60pkmyi.jpg",
  "https://pics3.baidu.com/feed/377adab44aed2e73e602d9cf012d129b86d6fa23.jpeg@f_auto?token=780279ea6096ec39000da36ea31207e3",
  "https://pics1.baidu.com/feed/14ce36d3d539b600a2d5b274617c863ac75cb793.jpeg@f_auto?token=ac514c57bbfa441e57ecc43e63cf73f8",
  "https://pics1.baidu.com/feed/95eef01f3a292df5510e348f3a1def7035a8731c.jpeg@f_auto?token=19822ad730dfedc21eeec5259784afaa",
  "https://pics4.baidu.com/feed/279759ee3d6d55fb6fc22b275a1ff64420a4dd73.jpeg@f_auto?token=4b34e6a070a0aa9fe650aef72be847fd",
  "https://pics3.baidu.com/feed/0d338744ebf81a4cdbd95eb05f06d349242da699.jpeg@f_auto?token=7b670150292a124d8f899bf848a48c7a",
  "https://minio.hezebin.com/blog/preview/a053dd1ae41ddadb56981d1c1f758ddf.jpeg",
];

/**
 * 从 IMAGES 中随机取一张封面图。
 *
 * @example
 * const cover = getRandomImage();
 */
export const getRandomImage = () => {
  const index = Math.floor(Math.random() * IMAGES.length);
  return IMAGES[index] ?? IMAGES[0];
};

// 歌曲文件列表
export const SONGS = [
  "https://hezebin.com/static/media/%E6%98%AF%E4%BD%A0-TFBOYS.deba2ffbcf889aca5b45.mp3",
  "https://hezebin.com/static/media/%E5%91%A8%E6%9D%B0%E4%BC%A6-%E7%A8%BB%E9%A6%99.46ddd8b452d7a726598d.mp3",
  "https://hezebin.com/static/media/%E8%AE%B8%E5%B5%A9-%E6%9C%89%E4%BD%95%E4%B8%8D%E5%8F%AF.dcaacecc849c1cdb12c2.mp3",
  "https://hezebin.com/static/media/%E5%91%A8%E6%9D%B0%E4%BC%A6-%E5%90%AC%E5%A6%88%E5%A6%88%E7%9A%84%E8%AF%9D.f64b52bd3085042effa6.mp3",
  "https://hezebin.com/static/media/%E7%A8%BB%E9%A6%99-Hope%E7%BB%84%E5%90%88.ef2c17f6d0b23f7751a5.mp3",
  "https://hezebin.com/static/media/%E8%89%BE%E8%BE%B0-%E6%81%8B%E7%88%B1%E5%95%A6.36e51ba0dcc46aced682.mp3",
  "https://hezebin.com/static/media/%E8%AE%B8%E5%B5%A9,%E8%8E%AB%E8%AF%97%E6%97%8E-%E4%BD%A0%E8%8B%A5%E6%88%90%E9%A3%8E.f8ef516e7f91ce37acb9.mp3",
  "https://hezebin.com/static/media/%E5%8B%87%E6%B0%94%E5%A4%A7%E7%88%86%E5%8F%91-%E5%9C%9F%E8%B1%86%E7%8E%8B%E5%9B%BD%E5%B0%8F%E4%B9%90%E9%98%9F.6e910d517fe6ecc7b4b0.mp3",
  "https://hezebin.com/static/media/You%20(=I)-%EB%B3%BC%EB%B9%A8%EA%B0%84%EC%82%AC%EC%B6%98%EA%B8%B0.21945ecd3380cc6aa8a9.mp3",
  "https://hezebin.com/static/media/%E6%88%91%E6%83%B3-%E8%91%A3%E6%98%B1%E6%98%86.25335cdcd33a5728b0cd.mp3",
  "https://cdn.truefilesize.com/test/test-100mb.bin",
  "https://cdn.truefilesize.com/test/test-500mb.bin",
  "https://cdn.truefilesize.com/test/test-1gb.bin",
];

/**
 * 从 SONGS 中随机取一首歌曲。
 *
 * @example
 * const url = getRandomSong();
 */
export const getRandomSong = () => {
  const index = Math.floor(Math.random() * SONGS.length);
  return SONGS[index] ?? SONGS[0];
};
