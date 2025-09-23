/**
 * 本地音乐播放器
 * 完全本地化的音乐播放器，不依赖任何外部API
 */
class CustomMusicPlayer {
  constructor() {
    // 本地数据管理器
    this.localData = null;
    
    // 播放器元素
    this.audioPlayer = document.getElementById('audio-player');
    this.playBtn = document.querySelector('.btn-play');
    this.prevBtn = document.querySelector('.btn-prev');
    this.nextBtn = document.querySelector('.btn-next');
    this.volumeBtn = document.querySelector('.btn-volume');
    this.volumeRange = document.querySelector('.volume-range');
    this.progressBar = document.querySelector('.progress-bar');
    this.progressFill = document.querySelector('.progress-fill');
    this.currentTimeEl = document.querySelector('.current-time');
    this.totalTimeEl = document.querySelector('.total-time');
    
    // 歌曲信息元素
    this.currentCover = document.getElementById('current-cover');
    this.currentTitle = document.querySelector('.current-song-title');
    this.currentArtist = document.querySelector('.current-song-artist');
    this.lyricsContent = document.querySelector('.lyrics-content');
    
    // 播放列表
    this.playlist = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isMuted = false;
    this.currentLyrics = [];
    this.currentLyricIndex = 0;
    
    this.init();
  }

  /**
   * 初始化播放器
   */
  async init() {
    this.showLoading();
    
    try {
      // 初始化本地数据管理器
      if (window.LocalMusicData) {
        this.localData = new window.LocalMusicData();
        const initialized = await this.localData.init();
        if (!initialized) {
          throw new Error('本地音乐数据初始化失败');
        }
      } else {
        throw new Error('本地音乐数据管理器未找到');
      }
      
      // 加载播放列表
      await this.loadPlaylist();
      
      // 绑定事件
      this.bindEvents();
      this.setupAudioEvents();
      
      // 确保播放列表不为空后再加载当前歌曲
      if (this.playlist && this.playlist.length > 0) {
        await this.loadCurrentSong();
      } else {
        throw new Error('播放列表为空');
      }
      
    } catch (error) {
      console.error('音乐播放器初始化失败:', error);
      this.showError('播放器初始化失败: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  /**
   * 加载播放列表
   */
  async loadPlaylist() {
    try {
      // 从本地数据获取所有歌曲
      const allSongs = this.localData.getAllSongs();
      if (!allSongs || allSongs.length === 0) {
        throw new Error('没有找到歌曲数据');
      }

      // 生成播放列表HTML
      const playlistContainer = document.querySelector('.playlist');
      const loadingPlaceholder = playlistContainer.querySelector('.loading-placeholder');
      
      // 清空加载占位符
      if (loadingPlaceholder) {
        loadingPlaceholder.remove();
      }

      // 生成歌曲项目
      allSongs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = `song-item ${index === 0 ? 'active' : ''}`;
        songItem.dataset.songId = song.id;
        
        songItem.innerHTML = `
          <div class="song-cover">
            <img class="song-cover-img" src="${song.cover || '/img/default-album.svg'}" alt="专辑封面">
          </div>
          <div class="song-info">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist}</div>
          </div>
          <div class="song-duration">${song.duration}</div>
        `;
        
        playlistContainer.appendChild(songItem);
      });

      // 构建播放列表数组
      const songItems = document.querySelectorAll('.song-item');
      this.playlist = Array.from(songItems).map((item, index) => ({
        id: item.dataset.songId,
        title: item.querySelector('.song-title').textContent,
        artist: item.querySelector('.song-artist').textContent,
        duration: item.querySelector('.song-duration').textContent,
        element: item
      }));
      
      // 设置当前播放的歌曲
      const activeItem = document.querySelector('.song-item.active');
      if (activeItem) {
        this.currentIndex = this.playlist.findIndex(song => song.element === activeItem);
      }
      

      
    } catch (error) {
      console.error('加载播放列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取歌曲详细信息
   */
  async fetchSongDetails() {
    const currentSong = this.playlist[this.currentIndex];
    if (!currentSong) {
      return null;
    }
    
    if (!this.localData) {
      return null;
    }

    try {
      const songInfo = this.localData.getSongById(currentSong.id);
      if (!songInfo) {
        throw new Error(`未找到歌曲信息: ${currentSong.id}`);
      }

      
      return songInfo;
    } catch (error) {
      console.error('获取歌曲详细信息失败:', error);
      return null;
    }
  }

  /**
   * 更新歌曲显示信息
   */
  updateSongDisplay(song) {
    if (!song) return;

    // 更新歌曲信息
    if (this.currentTitle) this.currentTitle.textContent = song.title;
    if (this.currentArtist) this.currentArtist.textContent = song.artist;
    
    // 更新封面
    if (this.currentCover) {
      this.currentCover.src = song.cover;
      this.currentCover.alt = `${song.title} - ${song.artist}`;
    }
    
    // 更新页面标题
    document.title = `${song.title} - ${song.artist} | 音乐播放器`;
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    console.log('=== bindEvents 函数被调用 ===');
    
    // 播放控制按钮
    if (this.playBtn) this.playBtn.addEventListener('click', () => this.togglePlay());
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.playPrevious());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.playNext());
    
    // 音量控制
    if (this.volumeBtn) this.volumeBtn.addEventListener('click', () => this.toggleMute());
    if (this.volumeRange) this.volumeRange.addEventListener('input', (e) => this.setVolume(e.target.value));
    
    // 进度条
    console.log('进度条元素:', this.progressBar);
    if (this.progressBar) {
      console.log('为进度条添加点击事件监听器');
      this.progressBar.addEventListener('click', (e) => {
        console.log('进度条被点击，调用 seekTo');
        this.seekTo(e);
      });
      
      // 添加鼠标悬停效果用于调试
      this.progressBar.addEventListener('mouseenter', () => {
        console.log('鼠标进入进度条区域');
      });
      
      this.progressBar.addEventListener('mouseleave', () => {
        console.log('鼠标离开进度条区域');
      });
    } else {
      console.error('进度条元素未找到！');
    }
    
    // 播放列表点击
    this.playlist.forEach((song, index) => {
      song.element.addEventListener('click', () => this.playSong(index));
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));
  }

  /**
   * 设置音频事件监听器
   */
  setupAudioEvents() {
    if (!this.audioPlayer) return;
    
    this.audioPlayer.addEventListener('timeupdate', () => this.updateProgress());
    this.audioPlayer.addEventListener('ended', () => this.playNext());
    this.audioPlayer.addEventListener('error', (e) => this.handleError(e));
    
    // 音频加载状态监听器
    this.audioPlayer.addEventListener('loadstart', () => this.onAudioLoadStart());
    this.audioPlayer.addEventListener('canplay', () => this.onAudioCanPlay());
    this.audioPlayer.addEventListener('loadedmetadata', () => this.onAudioMetadataLoaded());

  }

  /**
   * 加载当前歌曲
   */
  async loadCurrentSong() {
    try {
      // 获取歌曲详细信息
      const songDetails = await this.fetchSongDetails();
      if (!songDetails) {
        throw new Error('无法获取歌曲信息');
      }

      // 更新显示信息
      this.updateSongDisplay(songDetails);

      // 设置音频源
      if (this.audioPlayer && songDetails.url) {
        this.audioPlayer.src = songDetails.url;

      }

      // 加载歌词
      await this.loadLyrics(songDetails.id);

      // 更新活动项
      this.updateActiveItem();

    } catch (error) {
      console.error('加载当前歌曲失败:', error);
      this.showError('加载歌曲失败: ' + error.message);
    }
  }

  /**
   * 加载歌词
   */
  async loadLyrics(songId) {
    // 重置歌词状态
    this.currentLyrics = [];
    this.currentLyricIndex = -1;
    
    try {
      const lyricsText = await this.localData.loadLyrics(songId);
      if (lyricsText) {
        this.currentLyrics = this.parseLyrics(lyricsText);
        this.displayLyrics();
      } else {
        this.displayNoLyrics();
      }
    } catch (error) {
      console.error('加载歌词失败:', error);
      this.displayNoLyrics();
    }
  }

  /**
   * 解析LRC歌词格式
   */
  parseLyrics(lrcText) {
    if (!lrcText || typeof lrcText !== 'string') {
      return [];
    }
    
    const lines = lrcText.split('\n');
    const lyrics = [];
    
    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;
      
      // 支持两位数和三位数毫秒格式：[mm:ss.xx] 或 [mm:ss.xxx]
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3]);
        const text = match[4].trim();
        
        if (text) {
          // 根据毫秒位数调整计算方式
          const msMultiplier = match[3].length === 2 ? 10 : 1;
          const time = minutes * 60 + seconds + (milliseconds * msMultiplier) / 1000;
          lyrics.push({ time, text });
        }
      }
    });
    
    return lyrics.sort((a, b) => a.time - b.time);
  }

  /**
   * 显示歌词
   */
  displayLyrics() {
    if (!this.lyricsContent || !this.currentLyrics.length) return;
    
    this.lyricsContent.innerHTML = this.currentLyrics
      .map((lyric, index) => `<div class="lyric-line" data-index="${index}">${lyric.text}</div>`)
      .join('');
  }

  /**
   * 显示无歌词提示
   */
  displayNoLyrics() {
    if (this.lyricsContent) {
      this.lyricsContent.innerHTML = '<div class="no-lyrics">暂无歌词</div>';
    }
  }

  /**
   * 更新活动播放项
   */
  updateActiveItem() {
    // 移除所有活动状态
    this.playlist.forEach(song => song.element.classList.remove('active'));
    
    // 设置当前活动项
    if (this.playlist[this.currentIndex]) {
      this.playlist[this.currentIndex].element.classList.add('active');
    }
  }

  /**
   * 切换播放/暂停
   */
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 播放音乐
   */
  async play() {
    if (!this.audioPlayer) return;
    
    try {
      await this.audioPlayer.play();
      this.isPlaying = true;
      if (this.playBtn) {
        this.playBtn.innerHTML = '<i class="icon-pause"></i>';
      }
    } catch (error) {
      console.error('播放失败:', error);
      this.showError('播放失败');
    }
  }

  /**
   * 暂停音乐
   */
  pause() {
    if (!this.audioPlayer) return;
    
    this.audioPlayer.pause();
    this.isPlaying = false;
    if (this.playBtn) {
      this.playBtn.innerHTML = '<i class="icon-play"></i>';
    }

  }

  /**
   * 播放上一首
   */
  playPrevious() {
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadCurrentSong();
  }

  /**
   * 播放下一首
   */
  playNext() {
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.loadCurrentSong();
  }

  /**
   * 播放指定歌曲
   */
  playSong(index) {
    this.currentIndex = index;
    this.loadCurrentSong();
  }

  /**
   * 设置音量
   */
  setVolume(value) {
    if (this.audioPlayer) {
      this.audioPlayer.volume = value / 100;
      this.updateVolumeIcon(value);
    }
  }

  /**
   * 切换静音
   */
  toggleMute() {
    if (!this.audioPlayer) return;
    
    this.isMuted = !this.isMuted;
    this.audioPlayer.muted = this.isMuted;
    
    if (this.volumeBtn) {
      const icon = this.isMuted ? 'icon-volume-off' : 'icon-volume-up';
      this.volumeBtn.innerHTML = `<i class="${icon}"></i>`;
    }
  }

  /**
   * 更新音量图标
   */
  updateVolumeIcon(value) {
    if (!this.volumeBtn) return;
    
    let icon = 'icon-volume-off';
    if (value > 50) {
      icon = 'icon-volume-up';
    } else if (value > 0) {
      icon = 'icon-volume-down';
    }
    
    this.volumeBtn.innerHTML = `<i class="${icon}"></i>`;
  }

  /**
   * 跳转到指定位置
   */
  seekTo(event) {
    console.log('=== seekTo 函数被调用 ===');
    console.log('event:', event);
    console.log('this.audioPlayer:', this.audioPlayer);
    console.log('this.progressBar:', this.progressBar);
    
    if (!this.audioPlayer || !this.progressBar) {
      console.error('音频播放器或进度条元素未找到');
      return;
    }
    
    console.log('audioPlayer.duration:', this.audioPlayer.duration);
    console.log('audioPlayer.readyState:', this.audioPlayer.readyState);
    console.log('audioPlayer.currentTime:', this.audioPlayer.currentTime);
    
    // 检查音频是否已加载且有有效的duration
    if (!this.audioPlayer.duration || isNaN(this.audioPlayer.duration) || this.audioPlayer.duration <= 0) {
      console.warn('音频尚未加载完成，无法跳转');
      return;
    }
    
    // 检查音频是否处于可跳转状态
    if (this.audioPlayer.readyState < 2) {
      console.warn('音频数据不足，无法跳转');
      return;
    }
    
    const rect = this.progressBar.getBoundingClientRect();
    console.log('progressBar rect:', rect);
    console.log('event.clientX:', event.clientX);
    
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const seekTime = percent * this.audioPlayer.duration;
    
    console.log('计算的 percent:', percent);
    console.log('计算的 seekTime:', seekTime);
    
    // 确保seekTime在有效范围内
    if (seekTime >= 0 && seekTime <= this.audioPlayer.duration) {
      console.log('设置 currentTime 为:', seekTime);
      this.audioPlayer.currentTime = seekTime;
      console.log('设置后的 currentTime:', this.audioPlayer.currentTime);
    } else {
      console.error('seekTime 超出有效范围:', seekTime);
    }
  }

  /**
   * 更新播放进度
   */
  updateProgress() {
    if (!this.audioPlayer) return;
    
    const currentTime = this.audioPlayer.currentTime;
    const duration = this.audioPlayer.duration;
    
    // 更新进度条
    if (this.progressFill && duration) {
      const percent = (currentTime / duration) * 100;
      this.progressFill.style.width = `${percent}%`;
    }
    
    // 更新时间显示
    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(currentTime);
    }
    if (this.totalTimeEl && duration) {
      this.totalTimeEl.textContent = this.formatTime(duration);
    }
    
    // 更新歌词高亮
    this.updateLyricsHighlight(currentTime);
  }

  /**
   * 更新歌词高亮
   */
  updateLyricsHighlight(currentTime) {
    if (!this.currentLyrics.length) return;
    
    // 找到当前时间对应的歌词行
    let currentIndex = -1;
    for (let i = 0; i < this.currentLyrics.length; i++) {
      if (currentTime >= this.currentLyrics[i].time) {
        currentIndex = i;
      } else {
        break;
      }
    }
    
    // 更新高亮
    if (currentIndex !== this.currentLyricIndex) {
      // 移除之前的高亮
      const prevLine = document.querySelector('.lyric-line.active');
      if (prevLine) prevLine.classList.remove('active');
      
      // 添加新的高亮
      if (currentIndex >= 0) {
        const currentLine = document.querySelector(`.lyric-line[data-index="${currentIndex}"]`);
        if (currentLine) {
          currentLine.classList.add('active');
          this.scrollLyricIntoView(currentLine);
        }
      }
      
      this.currentLyricIndex = currentIndex;
    }
  }

  /**
   * 滚动歌词到可视区域
   */
  scrollLyricIntoView(lyricLine) {
    if (!this.lyricsContent || !lyricLine) return;
    
    const containerRect = this.lyricsContent.getBoundingClientRect();
    const lineRect = lyricLine.getBoundingClientRect();
    
    if (lineRect.top < containerRect.top || lineRect.bottom > containerRect.bottom) {
      lyricLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * 格式化时间显示
   */
  formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 处理键盘快捷键
   */
  handleKeyboard(event) {
    // 避免在输入框中触发
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.playPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.playNext();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const currentVolume = this.audioPlayer ? this.audioPlayer.volume * 100 : 50;
        this.setVolume(Math.min(100, currentVolume + 10));
        break;
      case 'ArrowDown':
        event.preventDefault();
        const currentVol = this.audioPlayer ? this.audioPlayer.volume * 100 : 50;
        this.setVolume(Math.max(0, currentVol - 10));
        break;
    }
  }

  /**
   * 显示加载动画
   */
  showLoading() {
    const loadingEl = document.querySelector('.loading-overlay');
    if (loadingEl) {
      loadingEl.style.display = 'flex';
    }
  }

  /**
   * 隐藏加载动画
   */
  hideLoading() {
    const loadingEl = document.querySelector('.loading-overlay');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  /**
   * 显示错误信息
   */
  showError(message) {
    console.error('播放器错误:', message);
    // 可以在这里添加用户友好的错误提示UI
  }

  /**
   * 音频开始加载
   */
  onAudioLoadStart() {
    console.log('音频开始加载');
    // 禁用进度条交互
    if (this.progressBar) {
      this.progressBar.style.pointerEvents = 'none';
      this.progressBar.style.opacity = '0.5';
    }
  }

  /**
   * 音频元数据加载完成
   */
  onAudioMetadataLoaded() {
    console.log('音频元数据加载完成');
    // 启用进度条交互
    if (this.progressBar) {
      this.progressBar.style.pointerEvents = 'auto';
      this.progressBar.style.opacity = '1';
    }
  }

  /**
   * 音频可以播放
   */
  onAudioCanPlay() {
    console.log('音频可以播放');
    // 确保进度条可以交互
    if (this.progressBar) {
      this.progressBar.style.pointerEvents = 'auto';
      this.progressBar.style.opacity = '1';
    }
  }

  /**
   * 处理音频错误
   */
  handleError(event) {
    console.error('音频播放错误:', event);
    this.showError('音频播放出错，请检查文件是否存在');
  }
}

// 初始化播放器
document.addEventListener('DOMContentLoaded', async () => {
  const player = new CustomMusicPlayer();
  window.musicPlayer = player;
});