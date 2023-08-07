// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit, Context, OnTriggerEvent } from '@devvit/public-api';
import { ModMail } from '@devvit/protos';

Devvit.configure({
  redditAPI: true,
});

const KARMA_REQUIREMENT = 100000;

Devvit.addTrigger({
  event: 'ModMail',
  onEvent: async (event: OnTriggerEvent<ModMail>, context: Context) => {
    // Bot should ignore its own messages
    if(event.messageAuthor!.id === context.appAccountId) {
      return;
    }

    // Get the user sending the message
    let user = await context.reddit.getUserByUsername(event.messageAuthor!.name);

    // Get the subreddit this message was made to
    let subreddit = await context.reddit.getSubredditById(context.subredditId);

    // Check if the user is already approved
    let approved = await subreddit.getApprovedUsers({
      username: user.username,
    }).all();

    // If they are, do nothing
    if(approved.length > 0) {
      return;
    }

    // If they aren't...
    // Check their karma
    if(user.commentKarma >= KARMA_REQUIREMENT || user.linkKarma >= KARMA_REQUIREMENT) {
      // Approve the user
      await subreddit.approveUser(user.username);
      // Respond to modmail
      await context.reddit.modMail.reply({
        conversationId: event.conversationId,
        body: "Welcome!",
      });
    } else {
      // Respond to modmail (optionally inflamatory)
      await context.reddit.modMail.reply({
        conversationId: event.conversationId,
        body: "boo you.",
      });
    }
  },
});

export default Devvit;
