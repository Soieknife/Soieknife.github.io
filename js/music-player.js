/**
 * 网易云风格音乐播放器
 * 简洁版本，仅包含基本播放控制功能
 */
class NeteaseMusicPlayer {
  constructor() {
    // 音频元素
    this.audio = null;
    
    // DOM元素
    this.albumCover = null;
    this.songTitle = null;
    this.songArtist = null;
    this.songAlbum = null;
    this.playBtn = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.volumeBtn = null;
    this.volumeSlider = null;
    this.progressContainer = null;
    this.progressFill = null;
    this.progressDot = null;
    this.currentTimeEl = null;
    this.totalTimeEl = null;
    this.playlistItems = null;
    this.playlistCount = null;
    
    // 播放状态
    this.isPlaying = false;
    this.currentIndex = 0;
    this.playlist = [];
    this.isDragging = false;
    
    this.init();
  }

  /**
   * 初始化播放器
   */
  init() {
    this.initializeElements();
    this.bindEvents();
    this.loadPlaylist();
    this.setVolume(70);
  }

  /**
   * 初始化DOM元素
   */
  initializeElements() {
    this.audio = document.getElementById('audio-player');
    this.albumCover = document.getElementById('album-cover');
    this.songTitle = document.getElementById('song-title');
    this.songArtist = document.getElementById('song-artist');
    this.songAlbum = document.getElementById('song-album');
    this.playBtn = document.getElementById('play-btn');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.volumeBtn = document.getElementById('volume-btn');
    this.volumeSlider = document.getElementById('volume-slider');
    this.progressContainer = document.querySelector('.progress-container');
    this.progressFill = document.querySelector('.progress-fill');
    this.progressDot = document.querySelector('.progress-dot');
    this.currentTimeEl = document.getElementById('current-time');
    this.totalTimeEl = document.getElementById('total-time');
    this.playlistItems = document.querySelector('.playlist-items');
    this.playlistCount = document.getElementById('playlist-count');
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 播放控制按钮
    this.playBtn?.addEventListener('click', () => this.togglePlay());
    this.prevBtn?.addEventListener('click', () => this.previousTrack());
    this.nextBtn?.addEventListener('click', () => this.nextTrack());
    
    // 音量控制
    this.volumeBtn?.addEventListener('click', () => this.toggleMute());
    this.volumeSlider?.addEventListener('input', (e) => this.setVolume(e.target.value));
    
    // 进度条控制
    this.progressContainer?.addEventListener('click', (e) => this.seekTo(e));
    this.progressContainer?.addEventListener('mousedown', (e) => this.startDrag(e));
    
    // 专辑封面点击播放
    this.albumCover?.parentElement.addEventListener('click', () => this.togglePlay());
    
    // 音频事件
    if (this.audio) {
      this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
      this.audio.addEventListener('timeupdate', () => this.updateProgress());
      this.audio.addEventListener('ended', () => this.nextTrack());
      this.audio.addEventListener('error', (e) => this.handleAudioError(e));
      this.audio.addEventListener('canplaythrough', () => this.handleAudioReady());
    }
    
    // 全局鼠标事件（用于进度条拖拽）
    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.endDrag());
  }

  /**
   * 处理音频准备就绪
   */
  handleAudioReady() {
    console.log('音频加载成功');
    // 清除可能存在的错误提示
    this.clearTrackError();
  }

  /**
   * 显示歌曲错误提示
   * @param {string} message - 错误消息
   */
  showTrackError(message) {
    // 在歌曲信息区域显示错误
    if (this.songTitle) {
      this.songTitle.style.color = '#ff4757';
      this.songTitle.textContent = message;
    }
  }

  /**
   * 清除歌曲错误提示
   */
  clearTrackError() {
    if (this.songTitle) {
      this.songTitle.style.color = '';
      // 恢复正常标题
      const currentSong = this.playlist[this.currentIndex];
      if (currentSong) {
        this.songTitle.textContent = currentSong.title;
      }
    }
  }

  /**
   * 加载播放列表（预设为空，等待用户提供歌曲ID）
   */
  loadPlaylist() {
    // 预设播放列表为空，等待用户配置
    this.playlist = [];
    this.renderPlaylist();
    this.updatePlaylistCount();
  }

  /**
   * 设置播放列表
   * @param {Array} playlist - 播放列表数组
   */
  setPlaylist(playlist) {
    this.playlist = playlist;
    this.currentIndex = 0;
    if (playlist.length > 0) {
      this.loadTrack(0);
      this.updatePlaylist();
    }
  }

  /**
   * 渲染播放列表
   */
  renderPlaylist() {
    if (!this.playlistItems) return;
    
    if (this.playlist.length === 0) {
      this.playlistItems.innerHTML = `
        <div class="empty-playlist">
          <p>暂无歌曲，请添加音乐到播放列表</p>
        </div>
      `;
      return;
    }
    
    const playlistHTML = this.playlist.map((song, index) => `
      <div class="playlist-item ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
        <div class="song-index">${index + 1}</div>
        <div class="song-details">
          <div class="song-name">${song.title}</div>
          <div class="song-artist-album">${song.artist}${song.album ? ' - ' + song.album : ''}</div>
        </div>
        <div class="song-duration">${this.formatTime(song.duration || 0)}</div>
      </div>
    `).join('');
    
    this.playlistItems.innerHTML = playlistHTML;
    
    // 绑定播放列表项点击事件
    this.playlistItems.querySelectorAll('.playlist-item').forEach((item, index) => {
      item.addEventListener('click', () => this.playTrack(index));
    });
  }

  /**
   * 更新播放列表计数
   */
  updatePlaylistCount() {
    if (this.playlistCount) {
      this.playlistCount.textContent = `${this.playlist.length}首歌曲`;
    }
  }

  /**
   * 播放指定曲目
   * @param {number} index - 曲目索引
   */
  playTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentIndex = index;
      this.loadTrack(index);
      this.play();
      this.updateActivePlaylistItem();
    }
  }

  /**
   * 加载曲目
   * @param {number} index - 曲目索引
   */
  loadTrack(index) {
    if (!this.playlist[index] || !this.audio) return;
    
    const song = this.playlist[index];
    
    // 更新音频源
    this.audio.src = song.url;
    
    // 更新显示信息
    this.updateTrackInfo(song);
    
    // 重置进度
    this.updateProgress();
  }

  /**
   * 更新曲目信息显示
   * @param {Object} song - 歌曲对象
   */
  updateTrackInfo(song) {
    if (this.songTitle) this.songTitle.textContent = song.title || '未知歌曲';
    if (this.songArtist) this.songArtist.textContent = song.artist || '未知艺术家';
    if (this.songAlbum) this.songAlbum.textContent = song.album || '';
    if (this.albumCover) this.albumCover.src = song.cover || '/img/default-album.svg';
  }

  /**
   * 切换播放/暂停
   */
  togglePlay() {
    if (!this.audio || this.playlist.length === 0) return;
    
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 播放
   */
  play() {
    if (!this.audio) return;
    
    this.audio.play().then(() => {
      this.isPlaying = true;
      this.updatePlayButton();
    }).catch(error => {
      console.error('播放失败:', error);
    });
  }

  /**
   * 暂停
   */
  pause() {
    if (!this.audio) return;
    
    this.audio.pause();
    this.isPlaying = false;
    this.updatePlayButton();
  }

  /**
   * 上一首
   */
  previousTrack() {
    if (this.playlist.length === 0) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
    this.loadTrack(this.currentIndex);
    if (this.isPlaying) {
      this.play();
    }
    this.updateActivePlaylistItem();
  }

  /**
   * 下一首
   */
  nextTrack() {
    if (this.playlist.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    this.loadTrack(this.currentIndex);
    if (this.isPlaying) {
      this.play();
    }
    this.updateActivePlaylistItem();
  }

  /**
   * 更新播放按钮状态
   */
  updatePlayButton() {
    if (!this.playBtn) return;
    
    const playIcon = this.playBtn.querySelector('.play-icon');
    const pauseIcon = this.playBtn.querySelector('.pause-icon');
    
    if (this.isPlaying) {
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
    } else {
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
    }
  }

  /**
   * 更新活动播放列表项
   */
  updateActivePlaylistItem() {
    if (!this.playlistItems) return;
    
    this.playlistItems.querySelectorAll('.playlist-item').forEach((item, index) => {
      if (index === this.currentIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  /**
   * 设置音量
   * @param {number} volume - 音量值 (0-100)
   */
  setVolume(volume) {
    if (!this.audio) return;
    
    this.audio.volume = volume / 100;
    this.updateVolumeIcon(volume);
    
    if (this.volumeSlider) {
      this.volumeSlider.value = volume;
    }
  }

  /**
   * 切换静音
   */
  toggleMute() {
    if (!this.audio) return;
    
    this.audio.muted = !this.audio.muted;
    this.updateVolumeIcon(this.audio.volume * 100);
  }

  /**
   * 更新音量图标
   * @param {number} volume - 音量值
   */
  updateVolumeIcon(volume) {
    if (!this.volumeBtn) return;
    
    const volumeHigh = this.volumeBtn.querySelector('.volume-high');
    const volumeMute = this.volumeBtn.querySelector('.volume-mute');
    
    if (this.audio.muted || volume === 0) {
      if (volumeHigh) volumeHigh.style.display = 'none';
      if (volumeMute) volumeMute.style.display = 'block';
    } else {
      if (volumeHigh) volumeHigh.style.display = 'block';
      if (volumeMute) volumeMute.style.display = 'none';
    }
  }

  /**
   * 跳转到指定位置
   * @param {Event} e - 鼠标事件
   */
  seekTo(e) {
    if (!this.audio || !this.progressContainer) return;
    
    const rect = this.progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekTime = percent * this.audio.duration;
    
    if (!isNaN(seekTime)) {
      this.audio.currentTime = seekTime;
    }
  }

  /**
   * 开始拖拽进度条
   * @param {Event} e - 鼠标事件
   */
  startDrag(e) {
    this.isDragging = true;
    this.seekTo(e);
  }

  /**
   * 拖拽进度条
   * @param {Event} e - 鼠标事件
   */
  drag(e) {
    if (this.isDragging) {
      this.seekTo(e);
    }
  }

  /**
   * 结束拖拽
   */
  endDrag() {
    this.isDragging = false;
  }

  /**
   * 更新播放进度
   */
  updateProgress() {
    if (!this.audio || !this.progressFill || !this.progressDot) return;
    
    const currentTime = this.audio.currentTime || 0;
    const duration = this.audio.duration || 0;
    
    if (duration > 0) {
      const percent = (currentTime / duration) * 100;
      this.progressFill.style.width = `${percent}%`;
      this.progressDot.style.left = `${percent}%`;
    }
    
    // 更新时间显示
    if (this.currentTimeEl) {
      this.currentTimeEl.textContent = this.formatTime(currentTime);
    }
  }

  /**
   * 更新总时长显示
   */
  updateDuration() {
    if (!this.audio || !this.totalTimeEl) return;
    
    const duration = this.audio.duration || 0;
    this.totalTimeEl.textContent = this.formatTime(duration);
  }

  /**
   * 格式化时间
   * @param {number} seconds - 秒数
   * @returns {string} 格式化的时间字符串
   */
  formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * 处理音频错误
   * @param {Event} e - 错误事件
   */
  handleAudioError(e) {
    console.error('音频加载错误:', e);
    
    const currentSong = this.playlist[this.currentIndex];
    if (!currentSong) return;
    
    // 如果当前歌曲有多个音源，尝试下一个
    if (currentSong.urls && currentSong.urls.length > 1) {
      const currentUrlIndex = currentSong.urls.indexOf(this.audio.src);
      const nextUrlIndex = currentUrlIndex + 1;
      
      if (nextUrlIndex < currentSong.urls.length) {
        console.log(`尝试备用音源 ${nextUrlIndex + 1}/${currentSong.urls.length}`);
        this.audio.src = currentSong.urls[nextUrlIndex];
        currentSong.url = currentSong.urls[nextUrlIndex]; // 更新当前使用的URL
        this.audio.load();
        return;
      }
    }
    
    // 所有音源都失败，显示错误并跳到下一首
    this.showTrackError(`无法播放 "${currentSong.title}"`);
    setTimeout(() => this.nextTrack(), 2000);
  }
}

/**
 * 页面加载完成后初始化播放器
 */
document.addEventListener('DOMContentLoaded', function() {
  // 检查是否存在音乐播放器容器
  const playerContainer = document.querySelector('.netease-music-player');
  
  if (playerContainer) {
    // 创建播放器实例
    window.musicPlayer = new NeteaseMusicPlayer();
    
    // 示例：如何添加歌曲到播放列表
    // 用户可以调用 window.musicPlayer.setPlaylist(songs) 来设置播放列表
    console.log('网易云风格音乐播放器已初始化');
    console.log('使用 window.musicPlayer.setPlaylist(songs) 来设置播放列表');
  }
});