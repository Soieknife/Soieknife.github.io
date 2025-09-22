/**
 * 音乐播放列表配置文件
 * 用于配置网易云风格音乐播放器的歌曲列表
 */

/**
 * 生成网易云音乐外链URL的多种方式
 * @param {string} songId - 网易云音乐歌曲ID
 * @returns {Array} 多个可能的URL
 */
function generateNeteaseUrls(songId) {
  return [
    `https://music.163.com/song/media/outer/url?id=${songId}.mp3`,
    `https://link.hhtjim.com/163/${songId}.mp3`,
    `https://api.injahow.cn/meting/?type=song&id=${songId}&source=netease&br=128000`,
    // 备用本地文件路径（如果用户有本地音频文件）
    `/audio/${songId}.mp3`
  ];
}

/**
 * 获取歌曲封面URL
 * @param {string} songId - 网易云音乐歌曲ID
 * @returns {string} 封面URL
 */
function getCoverUrl(songId) {
  // 尝试获取网易云封面，失败则使用默认封面
  return `https://api.injahow.cn/meting/?type=pic&id=${songId}&source=netease`;
}

/**
 * 预设播放列表
 * 包含用户提供的歌曲信息和备用音源
 */
const playlistData = [
  {
    id: 1,
    title: "说再见",
    artist: "本能實業",
    album: "",
    urls: [
      // 本地音频文件（如果有的话）
      '/music/audio/说再见-本能實業.mp3',
      // 其他音乐平台的链接
      'https://music.163.com/song/media/outer/url?id=1982501157.mp3',
      // 备用链接
      'https://music.163.com/api/song/enhance/player/url?id=1982501157&ids=[1982501157]&br=128000',
      // 演示音频（如果需要的话）
      'data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA'
    ],
    url: "", // 将在运行时确定可用的URL
    cover: getCoverUrl("1982501157"),
    fallbackCover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEwxMDAgMTUwTDUwIDEwMFoiIGZpbGw9IiNkZGQiLz4KPHN2Zz4K', // 备用封面
    duration: 0, // 将在加载时自动获取
    neteaseId: "1982501157"
  },
  // 添加一个演示歌曲，使用公开可用的音频
  {
    id: 2,
    title: '演示音乐',
    artist: '测试艺术家',
    album: '',
    urls: [
      // 使用一个公开的测试音频文件
      'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      'https://file-examples.com/storage/fe68c8c7c1a9f3c6b8c7c8c/2017/11/file_example_MP3_700KB.mp3'
    ],
    url: '',
    cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZmY0NzU3Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik04NSA4NUwxMTUgMTAwTDg1IDExNVoiIGZpbGw9IiNmZjQ3NTciLz4KPHN2Zz4K',
    fallbackCover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0xMDAgNTBMMTUwIDEwMEwxMDAgMTUwTDUwIDEwMFoiIGZpbGw9IiNkZGQiLz4KPHN2Zz4K',
    duration: 0,
    neteaseId: 'demo'
  }
  // 可以继续添加更多歌曲
  // {
  //   id: 3,
  //   title: "歌曲名",
  //   artist: "艺术家",
  //   album: "专辑名",
  //   urls: generateNeteaseUrls("歌曲ID"),
  //   url: "",
  //   cover: getCoverUrl("歌曲ID"),
  //   fallbackCover: "/img/default-album.svg",
  //   duration: 0,
  //   neteaseId: "歌曲ID"
  // }
];

/**
 * 测试音频URL是否可用
 * @param {string} url - 音频URL
 * @returns {Promise<boolean>} URL是否可用
 */
async function testAudioUrl(url) {
  return new Promise((resolve) => {
    const audio = new Audio();
    const timeout = setTimeout(() => {
      audio.src = '';
      resolve(false);
    }, 5000); // 5秒超时
    
    audio.addEventListener('canplaythrough', () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(true);
    });
    
    audio.addEventListener('error', () => {
      clearTimeout(timeout);
      audio.src = '';
      resolve(false);
    });
    
    audio.src = url;
  });
}

/**
 * 为歌曲找到可用的音频URL
 * @param {Object} song - 歌曲对象
 * @returns {Promise<string>} 可用的URL
 */
async function findWorkingUrl(song) {
  console.log(`正在为 "${song.title}" 寻找可用音源...`);
  
  for (let i = 0; i < song.urls.length; i++) {
    const url = song.urls[i];
    console.log(`测试音源 ${i + 1}/${song.urls.length}: ${url}`);
    
    const isWorking = await testAudioUrl(url);
    if (isWorking) {
      console.log(`✓ 找到可用音源: ${url}`);
      return url;
    } else {
      console.log(`✗ 音源不可用: ${url}`);
    }
  }
  
  console.warn(`⚠ 未找到可用音源: ${song.title}`);
  return ''; // 返回空字符串表示没有可用音源
}

/**
 * 测试封面图片是否可用
 * @param {string} url - 图片URL
 * @returns {Promise<boolean>} 图片是否可用
 */
async function testImageUrl(url) {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      resolve(false);
    }, 3000); // 3秒超时
    
    img.onload = () => {
      clearTimeout(timeout);
      resolve(true);
    };
    
    img.onerror = () => {
      clearTimeout(timeout);
      resolve(false);
    };
    
    img.src = url;
  });
}

/**
 * 初始化播放列表
 * 页面加载完成后自动调用，包含音源测试
 */
async function initializePlaylist() {
  // 等待播放器初始化完成
  if (!window.musicPlayer) {
    setTimeout(initializePlaylist, 500);
    return;
  }
  
  console.log('开始初始化播放列表...');
  
  // 为每首歌曲找到可用的音源和封面
  for (let song of playlistData) {
    // 测试音频URL
    song.url = await findWorkingUrl(song);
    
    // 测试封面URL
    const coverWorking = await testImageUrl(song.cover);
    if (!coverWorking) {
      console.log(`封面不可用，使用默认封面: ${song.title}`);
      song.cover = song.fallbackCover;
    }
  }
  
  // 过滤掉没有可用音源的歌曲
  const validSongs = playlistData.filter(song => song.url !== '');
  
  if (validSongs.length === 0) {
    console.error('没有找到任何可用的音源！');
    // 显示错误提示
    showErrorMessage('抱歉，暂时无法播放音乐。请稍后再试或联系管理员。');
    return;
  }
  
  window.musicPlayer.setPlaylist(validSongs);
  console.log(`播放列表已加载: ${validSongs.length}/${playlistData.length} 首歌曲可用`);
}

/**
 * 显示错误消息
 * @param {string} message - 错误消息
 */
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'music-error-notification';
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #ff4757;
    color: white;
    padding: 20px 30px;
    border-radius: 8px;
    font-size: 16px;
    z-index: 10000;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    text-align: center;
    max-width: 400px;
  `;
  
  document.body.appendChild(errorDiv);
  
  // 5秒后自动消失
  setTimeout(() => {
    if (document.body.contains(errorDiv)) {
      document.body.removeChild(errorDiv);
    }
  }, 5000);
}

// 页面加载完成后初始化播放列表
document.addEventListener('DOMContentLoaded', function() {
  // 延迟执行以确保播放器已初始化
  setTimeout(initializePlaylist, 1000);
});

/**
 * 添加新歌曲到播放列表的辅助函数
 * @param {string} title - 歌曲标题
 * @param {string} artist - 艺术家
 * @param {string} neteaseId - 网易云音乐ID
 * @param {string} album - 专辑名（可选）
 * @param {string} cover - 封面URL（可选）
 */
function addSongToPlaylist(title, artist, neteaseId, album = '', cover = '/img/default-album.svg') {
  const newSong = {
    id: playlistData.length + 1,
    title: title,
    artist: artist,
    album: album,
    url: generateNeteaseUrl(neteaseId),
    cover: cover,
    duration: 0,
    neteaseId: neteaseId
  };
  
  playlistData.push(newSong);
  
  // 如果播放器已初始化，更新播放列表
  if (window.musicPlayer) {
    window.musicPlayer.setPlaylist(playlistData);
  }
  
  console.log(`已添加歌曲: ${title} - ${artist}`);
}

// 导出函数供全局使用
window.addSongToPlaylist = addSongToPlaylist;