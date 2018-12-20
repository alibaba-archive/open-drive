'use strict';

class Base extends Error{
  constructor(message , code , status ){
    super(message)
    this.message = message || 'unknown';
    this.code = code || 'Internal';
    this.status = status || 500;
  }
  toString(){
    var opt = {
      code: this.code,
      message: this.message,
      status: this.status
    };
    return JSON.stringify(opt,' ',2);
  }
}


class Internal extends Base{
  constructor(message){
    super(message, 'Internal', 500);
  }
}


class NotFound extends Base{
  constructor(message){
    super(message, 'NotFound', 404);
  }
}

class InvalidParameter extends Base{
  constructor(message){
    super(message, 'InvalidParameter', 400);
  }
}

class UnAuthorized extends Base{
  constructor(message){
    super(message, 'UnAuthorized', 401);
  }
}
class NoPermission extends Base{
  constructor(message){
    super(message, 'NoPermission', 403);
  }
}

class AlreadyExists extends Base{
  constructor(message){
    super(message, 'AlreadyExists', 409);
  }
}
class ThirdPartError extends Base{
  constructor(message){
    super(message, 'ThirdPartError', 405);
  }
}
class NoAllowMethod extends Base{
  constructor(message){
    super(message, 'NoAllowMethod', 405);
  }
}
class ExceedQuota extends Base{
  constructor(message){
    super(message, 'ExceedQuota', 403);
  }
}
class NotEnoughSpace extends Base{
  constructor(message){
    super(message, 'NotEnoughSpace', 403);
  }
}

class NotEmpty extends Base{
  constructor(message){
    super(message, 'NotEmpty', 409);
  }
}

class StateConflict extends Base{
  constructor(message){
    super(message, 'StateConflict', 409);
  }
}



module.exports = {
  Base: Base,
  Internal: Internal,
  NotFound: NotFound,
  AlreadyExists: AlreadyExists,
  InvalidParameter:InvalidParameter,
  UnAuthorized:UnAuthorized,
  NoPermission:NoPermission,
  ThirdPartError: ThirdPartError,
  NoAllowMethod: NoAllowMethod,
  ExceedQuota: ExceedQuota,
  NotEnoughSpace: NotEnoughSpace,
  NotEmpty: NotEmpty,
  StateConflict: StateConflict
};
