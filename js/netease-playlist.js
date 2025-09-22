/**
 * 网易云音乐播放列表管理器
 * 负责管理播放列表和切换网易云官方播放器
 * 适配主题风格和黑暗/明亮模式
 */
class NeteasePlaylistManager {
  constructor() {
    this.playlist = [];
    this.currentIndex = 0;
    this.playerFrame = null;
    this.init();
  }

  /**
   * 初始化播放列表管理器
   */
  init() {
    this.loadPlaylist();
    this.bindEvents();
    this.updatePlayerInfo();
  }

  /**
   * 加载预设播放列表
   */
  loadPlaylist() {
    // 预设的歌曲列表，包含网易云音乐ID
    this.playlist = [
      {
        id: 1,
        title: '稻香',
        artist: '周杰伦',
        neteaseId: '186016',
        duration: '3:42'
      },
      {
        id: 2,
        title: '青花瓷',
        artist: '周杰伦',
        neteaseId: '186015',
        duration: '3:58'
      },
      {
        id: 3,
        title: '夜曲',
        artist: '周杰伦',
        neteaseId: '186014',
        duration: '4:32'
      },
      {
        id: 4,
        title: '七里香',
        artist: '周杰伦',
        neteaseId: '186017',
        duration: '4:05'
      },
      {
        id: 5,
        title: '简单爱',
        artist: '周杰伦',
        neteaseId: '186018',
        duration: '4:24'
      }
    ];
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 获取播放列表容器
    const playlistContainer = document.querySelector('.playlist');
    if (!playlistContainer) {
      console.warn('播放列表容器未找到');
      return;
    }

    // 为每个歌曲项绑定点击事件
    const songItems = playlistContainer.querySelectorAll('.song-item');
    songItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectSong(index);
      });

      // 添加键盘支持
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.selectSong(index);
        }
      });

      // 设置可访问性属性
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', `播放 ${this.playlist[index]?.title} - ${this.playlist[index]?.artist}`);
    });

    // 监听主题变化（如果支持）
    this.observeThemeChanges();
  }

  /**
   * 选择并播放指定歌曲
   * @param {number} index - 歌曲索引
   */
  selectSong(index) {
    if (index < 0 || index >= this.playlist.length) {
      console.warn('无效的歌曲索引:', index);
      return;
    }

    // 更新当前索引
    this.currentIndex = index;
    
    // 更新播放列表UI
    this.updatePlaylistUI();
    
    // 切换播放器
    this.switchPlayer(this.playlist[index]);
    
    // 更新播放器信息
    this.updatePlayerInfo();

    // 添加切换动画效果
    this.addSwitchAnimation();
  }

  /**
   * 更新播放列表UI状态
   */
  updatePlaylistUI() {
    const songItems = document.querySelectorAll('.song-item');
    
    songItems.forEach((item, index) => {
      // 移除所有active类
      item.classList.remove('active');
      
      // 为当前选中的歌曲添加active类
      if (index === this.currentIndex) {
        item.classList.add('active');
        
        // 滚动到当前选中的歌曲
        item.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    });
  }

  /**
   * 切换网易云播放器
   * @param {Object} song - 歌曲对象
   */
  switchPlayer(song) {
    const playerFrame = document.getElementById('netease-player');
    if (!playerFrame) {
      console.warn('播放器iframe未找到');
      return;
    }

    // 显示加载状态
    this.showLoadingState();

    // 构建网易云播放器URL - 使用原生播放器尺寸
    const playerUrl = `//music.163.com/outchain/player?type=2&id=${song.neteaseId}&auto=1&height=66`;
    
    // 更新iframe源
    playerFrame.src = playerUrl;
    
    // 监听iframe加载完成
    playerFrame.onload = () => {
      this.hideLoadingState();
      console.log(`已切换到: ${song.title} - ${song.artist}`);
    };

    // 设置超时处理
    setTimeout(() => {
      this.hideLoadingState();
    }, 3000);
  }

  /**
   * 显示加载状态
   */
  showLoadingState() {
    const playerContainer = document.querySelector('.current-player');
    if (playerContainer) {
      playerContainer.classList.add('loading');
      
      // 如果没有加载指示器，创建一个
      if (!playerContainer.querySelector('.loading-indicator')) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = '正在加载播放器...';
        playerContainer.appendChild(loadingDiv);
      }
    }
  }

  /**
   * 隐藏加载状态
   */
  hideLoadingState() {
    const playerContainer = document.querySelector('.current-player');
    if (playerContainer) {
      playerContainer.classList.remove('loading');
      
      // 移除加载指示器
      const loadingIndicator = playerContainer.querySelector('.loading-indicator');
      if (loadingIndicator) {
        loadingIndicator.remove();
      }
    }
  }

  /**
   * 更新播放器信息显示
   */
  updatePlayerInfo() {
    const currentSong = this.playlist[this.currentIndex];
    if (!currentSong) return;

    // 更新页面标题（如果需要）
    const playerTitle = document.querySelector('.player-title');
    if (playerTitle) {
      playerTitle.textContent = `当前播放: ${currentSong.title}`;
    }

    // 更新浏览器标题
    document.title = `${currentSong.title} - ${currentSong.artist} | 我在听`;
  }

  /**
   * 添加切换动画效果
   */
  addSwitchAnimation() {
    const playerContainer = document.querySelector('.current-player');
    if (playerContainer) {
      playerContainer.style.transform = 'scale(0.98)';
      playerContainer.style.opacity = '0.8';
      
      setTimeout(() => {
        playerContainer.style.transform = 'scale(1)';
        playerContainer.style.opacity = '1';
      }, 150);
    }
  }

  /**
   * 监听主题变化
   */
  observeThemeChanges() {
    // 监听系统主题变化
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleThemeChange = (e) => {
        console.log('主题已切换到:', e.matches ? '暗色模式' : '明亮模式');
        // 可以在这里添加主题切换时的特殊处理
        this.adaptToTheme(e.matches);
      };

      // 初始检查
      handleThemeChange(darkModeQuery);
      
      // 监听变化
      if (darkModeQuery.addListener) {
        darkModeQuery.addListener(handleThemeChange);
      } else {
        darkModeQuery.addEventListener('change', handleThemeChange);
      }
    }
  }

  /**
   * 适配主题模式
   * @param {boolean} isDark - 是否为暗色模式
   */
  adaptToTheme(isDark) {
    const musicPage = document.querySelector('.music-page');
    if (musicPage) {
      if (isDark) {
        musicPage.classList.add('dark-theme');
      } else {
        musicPage.classList.remove('dark-theme');
      }
    }
  }

  /**
   * 播放上一首歌曲
   */
  playPrevious() {
    const prevIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.playlist.length - 1;
    this.selectSong(prevIndex);
  }

  /**
   * 播放下一首歌曲
   */
  playNext() {
    const nextIndex = this.currentIndex < this.playlist.length - 1 ? this.currentIndex + 1 : 0;
    this.selectSong(nextIndex);
  }

  /**
   * 获取当前播放的歌曲信息
   * @returns {Object} 当前歌曲对象
   */
  getCurrentSong() {
    return this.playlist[this.currentIndex];
  }

  /**
   * 获取播放列表
   * @returns {Array} 播放列表数组
   */
  getPlaylist() {
    return this.playlist;
  }
}

// 页面加载完成后初始化播放列表管理器
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否在音乐页面
  if (document.querySelector('.music-page')) {
    window.playlistManager = new NeteasePlaylistManager();
    
    // 添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
      if (!window.playlistManager) return;
      
      switch(e.key) {
        case 'ArrowLeft':
          if (e.ctrlKey) {
            e.preventDefault();
            window.playlistManager.playPrevious();
          }
          break;
        case 'ArrowRight':
          if (e.ctrlKey) {
            e.preventDefault();
            window.playlistManager.playNext();
          }
          break;
      }
    });
    
    console.log('网易云音乐播放列表管理器已初始化');
  }
});