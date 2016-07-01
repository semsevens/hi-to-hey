ModalEffects.init();

function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}

var app = angular.module('hi-to-hey', ['zInfiniteScroll', 'btford.socket-io'])
var serverBaseUrl = 'http://127.0.0.1:2016';

app.factory('socket', function(socketFactory) {
  var myIoSocket = io.connect(serverBaseUrl);

  var socket = socketFactory({
    ioSocket: myIoSocket
  });

  return socket;
});

app.controller('MainCtrl', function($scope, $timeout, $q, socket, $http) {
  $scope.anonymous = 'anonymous';
  $scope.hasLogin = false;
  $scope.username = $scope.anonymous;
  $scope.user = '';
  $scope.message = '';
  $scope.messages = [];
  $scope.lastCreated = '';
  $scope.isLoading = false;
  $scope.isNoMoreMessage = false;

  $scope.loadOlder = function() {
    var deferred = $q.defer();
    if (!$scope.isLoading && !$scope.isNoMoreMessage) {
      $scope.isLoading = true
      $timeout(function() {
        var data = {
          room: $scope.room,
          lastCreated: $scope.lastCreated
        };
        $http.post(serverBaseUrl + '/msg', data).success(function(msgs) {
          if (msgs.length > 0) {
            $scope.lastCreated = msgs[0].created;
            $scope.messages.unshift.apply($scope.messages, msgs);
          } else {
            $scope.isNoMoreMessage = true;
          }
          $scope.isLoading = false;
          deferred.resolve();
        });

      }, 1000);
    } else {
      deferred.reject();
    }
    return deferred.promise;
  };

  socket.on('setup', function(data) {
    $scope.defaultRoom = data.defaultRoom;
    $scope.room = data.defaultRoom;
    $scope.rooms = data.rooms;
  });

  $scope.login = function() {
    socket.emit('new user', {
      username: $scope.user,
      room: $scope.room
    });
  };

  socket.on('login success', function(data) {
    $scope.username = data.username;
    $scope.hasLogin = true;
    initRoom($scope.room);
    ModalEffects.hideModal();
  });

  socket.on('login failed', function(data) {
    $scope.hasLogin = false;
    $scope.user = '';
    alert(data.reason);
  });

  socket.on('warning', function(data) {
    var data = {
      username: 'system',
      content: data.content + '<br>' + data.detail
    }
    chat.receiveMessage(data);
  });

  socket.on('user joined', function(data) {
    if ($scope.hasLogin && $scope.username != data.username) {
      var data = {
        username: 'system',
        content: data.username + ' has joined'
      }
      chat.receiveMessage(data);
    }
  });

  socket.on('user left', function(data) {
    if (data.username != $scope.username) {
      var data = {
        username: 'system',
        content: data.username + ' has left'
      }
      chat.receiveMessage(data);
    }
  });

  $scope.send = function(msg) {
    socket.emit('new message', {
      room: $scope.room,
      message: msg,
      username: $scope.username
    });
  };


  socket.on('calculated', function(data) {
    chat.receiveMessage(data);
  });

  socket.on('instructed', function(data) {
    chat.receiveMessage(data);
  });

  socket.on('message created', function(data) {
    if (data.username === $scope.username)
      chat.sendMessage(data);
    else
      chat.receiveMessage(data);
  });

  function initRoom(newRoom) {
    var data = {
      room: newRoom
    };
    $http.post(serverBaseUrl + '/msg', data).success(function(msgs) {
      $scope.room = newRoom;
      $scope.lastCreated = '';
      $scope.isLoading = false;
      $scope.isNoMoreMessage = false;
      $scope.messages = msgs;
    });
  };

  $scope.changeRoom = function(newRoom) {
    $('.new').remove();
    socket.emit('switch room', {
      oldRoom: $scope.room,
      newRoom: newRoom,
      username: $scope.username
    });
    initRoom(newRoom);
  };


  //Launch Modal
  $scope.usernameModal = function(ev) {

    // rewrite the onChange function of select one
    SelectFx.prototype.options.onChange = function(val) {
      if (val != $scope.room) {
        $scope.changeRoom(val);
      }
    };

    // When room repeat finished,
    // create the SelectFx for every room option.
    $scope.$on('roomRepeatFinished', function(ngRepeatFinishedEvent) {
      [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function(el) {
        new SelectFx(el);
      });
    });

    // When message repeat finished,
    // go down the scroll to the bottom.
    $scope.$on('messageRepeatFinished', function(ngRepeatFinishedEvent) {
      chat.updateMessagesList();
      chat.goDown();
    });

    chat.sendButton.click(function(event) {
      event.preventDefault();
      var message = chat.input.text();
      if (message == "") return;
      $scope.message = message;
      $scope.send($scope.message);
    });

    chat.sendButton.on("touchstart", function(event) {
      event.preventDefault();
      var message = chat.input.text();
      if (message == "") return;
      $scope.message = message;
      $scope.send($scope.message);
    });
  };


});

app.directive('onFinishRender', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function() {
          scope.$emit(attr.onFinishRender);
        });
      }
    }
  }
});

app.directive('ngLogin', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13 && !scope.hasLogin) {
        var user = myTrim(scope.user);
        if (user != "" && user.toLowerCase() != scope.anonymous.toUpperCase()) {
          event.preventDefault();
          scope.$eval(function() {
            scope.hasLogin = true;
            scope.login();
          });
        }
      }
    });
  };
});


app.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if (event.which === 13) {
        event.preventDefault();
        scope.$eval(function() {
          message = chat.input.text();
          if (message == "") return;
          scope.message = message;
          scope.$apply(attrs.ngEnter);
        });
      }
    });
  };
});
