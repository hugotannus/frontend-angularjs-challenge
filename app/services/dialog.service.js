(function () {
  "use strict"

  angular
    .module("dialogService", ["ngDialog"])
    .factory("Dialog", Dialog);

  Dialog.$inject = ['ngDialog']

  function Dialog(ngDialog) {
    const self = this;

    self.openedDialog = '';

    return {
      open: open,
      close: close
    };

    ////////////////////////////

    function close(global) {
      self.openedDialog.close();
      global.dialogOpen = false;

      return true;
    }

    function open(seqId, global, sequences, scope) {
      global.seqError = false;
      global.dialogOpen = true;

      if (typeof (seqId) === 'number') {
        global.id = seqId;
        global.editSeq = angular.copy(sequences[seqId]);
        global.deleteDisable = false;
      } else {
        global.id = -1;
        global.deleteDisable = true;
        global.editSeq = {
          name: "",
          structure: "",
          rate: 0,
          prob: 0
        }
      }

      self.openedDialog = ngDialog.open({
        template: "popup.html",
        className: "ngdialog-theme-default",
        scope: scope,
      });
    };
  }
}());