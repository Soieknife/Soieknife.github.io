/**
 * 本地音乐数据管理器
 * 完全本地化的音乐播放器数据管理
 */
class LocalMusicData {
    constructor() {
        this.data = null;
        this.initialized = false;
        this.defaultCover = '/img/default-album.svg';
    }

    /**
     * 初始化本地音乐数据
     * @returns {Promise<boolean>} 初始化是否成功
     */
    async init() {
        try {
            console.log('正在初始化本地音乐数据...');
            const response = await fetch('/data/songs.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            this.initialized = true;
            console.log(`本地音乐数据初始化成功，共加载 ${this.data.songs.length} 首歌曲`);
            return true;
        } catch (error) {
            console.error('本地音乐数据初始化失败:', error);
            this.initialized = false;
            return false;
        }
    }

    /**
     * 根据ID获取歌曲信息
     * @param {string} id 歌曲ID
     * @returns {Object|null} 歌曲信息对象
     */
    getSongById(id) {
        if (!this.initialized || !this.data) {
            console.warn('本地数据未初始化');
            return null;
        }

        const song = this.data.songs.find(s => s.id === id);
        if (!song) {
            console.warn(`未找到ID为 ${id} 的歌曲`);
            return null;
        }

        return {
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            cover: song.cover || this.defaultCover,
            url: song.url
        };
    }

    /**
     * 获取歌曲播放URL
     * @param {string} id 歌曲ID
     * @returns {string|null} 播放URL
     */
    getSongUrl(id) {
        const song = this.getSongById(id);
        return song ? song.url : null;
    }

    /**
     * 获取歌曲封面URL
     * @param {string} id 歌曲ID
     * @returns {string} 封面URL
     */
    getCoverUrl(id) {
        const song = this.getSongById(id);
        return song ? (song.cover || this.defaultCover) : this.defaultCover;
    }

    /**
     * 加载歌词
     * @param {string} id 歌曲ID
     * @returns {Promise<string|null>} 歌词内容
     */
    async loadLyrics(id) {
        try {
            const response = await fetch(`/data/lyrics/${id}.lrc`);
            if (!response.ok) {
                console.warn(`未找到歌曲 ${id} 的歌词文件`);
                return null;
            }
            const lyrics = await response.text();
            console.log(`成功加载歌曲 ${id} 的歌词`);
            return lyrics;
        } catch (error) {
            console.error(`加载歌词失败 (${id}):`, error);
            return null;
        }
    }

    /**
     * 获取所有歌曲列表
     * @returns {Array} 歌曲列表
     */
    getAllSongs() {
        if (!this.initialized || !this.data) {
            return [];
        }
        return this.data.songs.map(song => ({
            id: song.id,
            title: song.title,
            artist: song.artist,
            album: song.album,
            duration: song.duration,
            cover: song.cover || this.defaultCover
        }));
    }

    /**
     * 搜索歌曲
     * @param {string} query 搜索关键词
     * @returns {Array} 匹配的歌曲列表
     */
    searchSongs(query) {
        if (!this.initialized || !this.data || !query) {
            return [];
        }

        const lowerQuery = query.toLowerCase();
        return this.data.songs.filter(song => 
            song.title.toLowerCase().includes(lowerQuery) ||
            song.artist.toLowerCase().includes(lowerQuery) ||
            song.album.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * 获取数据库元信息
     * @returns {Object|null} 元信息对象
     */
    getMetadata() {
        return this.initialized && this.data ? this.data.metadata : null;
    }

    /**
     * 检查是否已初始化
     * @returns {boolean} 初始化状态
     */
    isInitialized() {
        return this.initialized;
    }
}

// 创建全局实例
window.LocalMusicData = LocalMusicData;