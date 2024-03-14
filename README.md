
# To Do Messenger - Backend
![image](https://github.com/minseung1226/project/assets/102594142/ba514bed-76cc-4616-add2-35f49fb53170)

**To do Messenge**r는 사용자들의 **그룹 채팅과 1:1 채팅 기능**을 지원하고 있습니다. 또한 사용자들이 간편하게 스케줄을 관리할 수 있도록 **Todo List 기능**도 추가했습니다. 메신저 프로그램을 통해 팀원들과의 소통을 원활하게 하고, 할 일을 효율적으로 관리할 수 있습니다.

<br/><br/><br/><br/><br/>

## 📆프로젝트 기간
2023.12~2024.02

<br/><br/><br/><br/><br/>

## ♣️기술스택
- **백앤드** : Node.js
- **프레임워크** : Express
- **데이터 베이스** : MongoDB
- **네트워크 통신** : HTTP, Socket

<br/><br/><br/><br/><br/>
## DATABASE
![image](https://github.com/minseung1226/todoMessenger-front/assets/102594142/0dfc54d9-3d59-4ddc-b2f8-b1c27aac0b39)

<br/><br/><br/><br/><br/>

## 🌐API

### HTTP


<br>

|description|URL|Method|param|headers|return|
|------|---|---|---|---|---|
|login|/login|POST|ID : [String]<br>password : [String]||ok : [Boolean]|
|logout|/logout|POST||Authorization:token|ok : [Boolean]|
|id 중복확인|/idDuplication|POST|loginId:[String]||ok : [Boolean]|
|회원가입 |/join|POST|name : [String]<br>loginId : [String]<br> password : [String] ||ok : [Boolean]|
|인증번호 전송|/sendCode|POST|phoneNumber : [String]||return : code : [Integer]|

<br/><br/><br/>
### SOCKET 통신
<br/>



|description|eventname|Method|param|return|
|----|---|---|---|----------|
|사용자 조회|findUser|on|token:[String]|user: { <br/>  &emsp; name:[String]<br/>  &emsp; rooms:[ObjectId[]]<br/>  &emsp; profileImg:[String]<br/>  &emsp;friends:[ObjectId[]]  |
|비밀번호 변경|changePassword|on|token: [string]<br/> password: [String]|ok :[Boolean|
|친구 목록 조회|friendList|on|token : [String]|friendList : {<br/> &emsp;   id:[ObjectId]<br/>  &emsp;  name:[String]<br/>  &emsp;  online:[Boolean]<br/>   &emsp; profileImg:[String]</br> &emsp;}|
|친구 추가|addFriend|on|token : [String]<br/>friendId:[String]|ok: [Boolean]|
|채팅방 목록 조회|roomList|on|token:[String]|chatRoomListInfo :{<br/> &emsp;name:[String] <br/> &emsp; chat:[String] <br/> &emsp; chatCreatedAt :[Date] unreadCount : [Integer] <br/> &emsp; members[{ <br/> &emsp; &emsp; &emsp; id:[ObjectId] <br/> &emsp; &emsp; &emsp; name:[String] <br/>&emsp; &emsp; &emsp; profileImg:[String] <br/> &emsp; &emsp; &emsp;online : [Boolean] <br/> &emsp; &emsp; &emsp;}]<br/> &emsp;}|
|채팅과 사용자 조회|getAllChatsAndUser|on|roomId:[String]<br/>token:[String]|roomChatUser:{<br/> &emsp;room:{<br/> &emsp;&emsp;&emsp;name:[String]<br/> &emsp;&emsp;&emsp;id:[ObjectId]<br/> &emsp;&emsp;}<br/> &emsp;user:{<br/> &emsp;&emsp;&emsp;name:[String]<br/> &emsp;&emsp;&emsp;online:[Boolean]<br/> &emsp;&emsp;&emsp;profileImg:[String]<br/> &emsp;&emsp;&emsp;friends : [id:[ObjectId]]<br/> &emsp;&emsp;} <br/> &emsp; chat:{<br/> &emsp;&emsp;&emsp;chat:[String] <br/> &emsp;&emsp;&emsp;user:{id:[ObjectId]}<br/> &emsp;&emsp;&emsp;room:[ObjectId] <br/> &emsp;&emsp;&emsp;unreadMember[]:[ObjectId]<br/> &emsp;&emsp;}<br/> &emsp;}
|채팅방생성|createChatRoom|on|token:[String]<br/>selectFriendIds:[String[]]|ok:[Boolean]<br/>roomId:[ObjectId]|
|채팅방 퇴장|leaveRoom|on|token:[String]<br/>roomId:[String]|ok:[Boolean]|
|메시지 전송|sendMessage|on|receivedMessage:[String] <br/>roomId:[String]<br/>token:[String]|ok:[Boolean]||
|일정 등록|scheduleCreate|on|token:[String]<br/>message:[String]<br/>dates:[Date[]]|ok:[Boolean]|
|스케줄 조회|schedule|on|token:[String]<br/>date:[Date]|schedules:{<br/> &emsp;message:[String] <br/> &emsp; scheduleDate:[Date]<br/> &emsp;success:[Boolean] <br/> &emsp;}|
|일별 스케줄 개수 조회|getScheduleCountForMonth|on|token:[String] <br/> date:[Date] |scheduleCount:[Map]|
|스케줄 삭제|deleteSchedule|on|scheduleId:[String]|ok:[Boolean]|

<hr>

**To do Messenger-front** :
[github-front](https://github.com/minseung1226/todoMessenger-front)
<br/>
**Notion** : 
[Notion](https://quaint-halloumi-dde.notion.site/To-Do-Messenger-0363888d71914ba1bf3a14d6bf4e512a?pvs=4)
