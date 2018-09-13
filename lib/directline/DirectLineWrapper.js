module.exports = class DirectLineWrapper {
  constructor(directlineClient, user) {
    this._messagingCallbacks = [];
    this._user = user;
    this.client = directlineClient;
    this.client.activity$
      .filter(activity => activity.type === 'message' && activity.from.id == process.env.botId && activity.replyToId)
      .subscribe(this._activityHandler.bind(this));
  }
  _activityHandler(activity) {
    this._messagingCallbacks.map(callback => callback(activity));
  }
  addEventListener(callback) {
    this._messagingCallbacks.push(callback);
  }
  get conversationId() {
    return this.client.conversationId;
  }
  endConversation(userId) {
    this.client.postActivity({
      type: "endOfConversation",
      from: {
        id: userId,
      }
    })
    .subscribe(
      id => (id) => console.log("Conversation end request sent: " + id),
      error => {
        console.error("Error posting request to end conversation", error);
      }
    );
  }
  removeEventListener(callback) {
    this._messagingCallbacks.splice(this._messagingCallbacks.indexOf(callback), 1);
  }
  sendMessage(user, message, userId) {
    // Patch if user isn't provided
    user = user || {};
    const activity = {
      type: "message",
      text: message,
      from: { id: userId, name: user.displayName ,summary: user},
      locale: process.env.msglocale || "ja-JP",
      timestamp: (new Date()).toISOString(),
    };
    console.log("[BOT-FRAMEWORK] Sending activity: ", activity);
    this.client
      .postActivity(activity)
      .subscribe(
        id => (id) => console.log("Message sent with ID: " + id),
        error => {
          console.error("Error posting activity", error);
        }
      );
  }
}