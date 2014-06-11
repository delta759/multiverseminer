function Statistics(key) {
    this.key = key;
    this.clickCount = 0;
    this.autoDigCount = 0;
    this.manualDigCount = 0;
    this.manualGatherCount = 0;
    this.manualScavengeCount = 0;
    this.autoScavengeCount = 0;
    this.autoGatherCount = 0;

    // ---------------------------------------------------------------------------
    // general
    // ---------------------------------------------------------------------------
    this.initialize = function() {};

    // ---------------------------------------------------------------------------
    // internal
    // ---------------------------------------------------------------------------
    this._getStorageKey = function() {
        return 'stat_' + this.id + '_';
    };

    // ---------------------------------------------------------------------------
    // loading / saving / reset
    // ---------------------------------------------------------------------------
    this.save = function() {
        var storageKey = this._getStorageKey();
        localStorage[storageKey + 'clickCount'] = this.clickCount;
        localStorage[storageKey + 'manualDigCount'] = this.manualDigCount;
        localStorage[storageKey + 'autoGatherCount'] = this.autoGatherCount;
        localStorage[storageKey + 'manualGatherCount'] = this.manualGatherCount;
        localStorage[storageKey + 'autoScavengeCount'] = this.autoScavengeCount;
        localStorage[storageKey + 'manualScavengeCount'] = this.manualScavengeCount;
        localStorage[storageKey + 'autoDigCount'] = this.autoDigCount;
    };

    this.load = function() {
        var storageKey = this._getStorageKey();
        this.clickCount = utils.loadInt(storageKey + 'clickCount', 1);
        this.manualDigCount = utils.loadInt(storageKey + 'manualDigCount', 1);
        this.autoDigCount = utils.loadInt(storageKey + 'autoDigCount', 1);
        this.manualGatherCount = utils.loadInt(storageKey + 'manualGatherCount', 1);
        this.autoGatherCount = utils.loadInt(storageKey + 'autoGatherCount', 0);
        this.manualScavengeCount = utils.loadInt(storageKey + 'manualScavengeCount', 1);
        this.autoScavengeCount = utils.loadInt(storageKey + 'autoScavengeCount', 0);

    };

    this.reset = function(fullReset) {
        this.clickCount = 0;
        this.manualDigCount = 0;
        this.manualGatherCount = 0;
        this.manualScavengeCount = 0;
        this.autoScavengeCount = 0;
        this.autoGatherCount = 0;
        this.autoDigCount = 0;
    };
};
