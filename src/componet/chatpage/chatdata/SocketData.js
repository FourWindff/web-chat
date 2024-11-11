

class SocketObject{
    constructor(sourceUserId,targetUserId,data,type) {
        this.sourceUserId = sourceUserId;
        this.targetUserId = targetUserId;
        this.type = type;//init chat file link login
        this.data=data;
    }

    parse2JSON(){
        return JSON.stringify({
            type: this.type,
            sourceUserId: this.sourceUserId,
            targetUserId: this.targetUserId,
            data: this.data,
        });
    }

    static parse2Object(JSONString) {
        const parsed = JSON.parse(JSONString);
        // 可选：在这里验证结构是否合法
        return new SocketObject(parsed.sourceUserId, parsed.targetUserId, parsed.data, parsed.type);
    }

}

class UserDetails{
    constructor(username,userid,password){
        this.username=username;
        this.userid=userid;
        this.password=password;
    }
}

export {SocketObject,UserDetails};