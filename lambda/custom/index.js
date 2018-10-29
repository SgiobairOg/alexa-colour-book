/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const random = require('random');

/* INTENT HANDLERS */
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const speakOutput = requestAttributes.t('WELCOME_MESSAGE', requestAttributes.t('SKILL_NAME'));
    const repromptOutput = requestAttributes.t('WELCOME_REPROMPT');

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(repromptOutput)
      .getResponse();
  },
};

const getRandomTriple = () => random.int(0,255);

const getRandomColour = () => {
  const rgb = ['red', 'green', 'blue'].reduce( (map, key) => {
		map[key] = getRandomTriple();
		return map;
  }, {});
  return rgb;
};

const RandomColourHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'RandomColourIntent';
  },
  handle(handlerInput) {
    console.log('Random Colour Invoked...');
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    const colour = getRandomColour();
    console.log('Colour: ', colour);

    const cardTitle = requestAttributes.t('DISPLAY_CARD_TITLE', requestAttributes.t('SKILL_NAME'), 'Random Color');
    console.log('Card Title: ', cardTitle);
    let speakOutput = "";

    if (colour) {
      sessionAttributes.speakOutput = requestAttributes.t('COLOUR_MESSAGE', colour.red, colour.green, colour.blue);
      //sessionAttributes.repromptSpeech = requestAttributes.t('RECIPE_REPEAT_MESSAGE');
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      const primaryText = requestAttributes.t('COLOUR_TEXT_MESSAGE', colour.red, colour.green, colour.blue);
      console.log('Primary:', primaryText);
      const secondaryText = requestAttributes.t('COLOUR_TEXT_SECONDARY_MESSAGE');
      //const image = require('./assets/colour.jpg');
      /*const template = {
        "type": "Display.RenderTemplate",
        "template": {
          "type":"BodyTemplate1",
          "token": "string",
          "backButton": "HIDDEN",
          "backgroundImage": {
            "contentDescription": "Textured grey background",
            "sources": [
              {
                "url": "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
              }
            ],
            "title": "My Favorite Car",
            "image": {
              "contentDescription": "My favorite car",
              "sources": [
                {
                  "url": "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260"
                }
              ]
            },
            "textContent": {
              "primaryText": {
                "text": primaryText,
                "type": "PlainText"
              },
              "secondaryText": {
                "text": secondaryText,
                "type": "PlainText"
              },
              "tertiaryText": {
                "text": "By me!",
                "type": "PlainText"
              }
            }
          },
          "title": cardTitle
        }
      };*/
      const template = {
        "type": "BodyTemplate1",
        "token": "color",
        "title": cardTitle,
        "textContent": {
          "primaryText": {
            "type": "PlainText",
            "text": primaryText
          }
        },
        "backButton": "HIDDEN"
      };
      console.log('Template: ', template);

      const response = handlerInput.responseBuilder;

      console.log('Response: ', response);

      response
        .speak(sessionAttributes.speakOutput) // .reprompt(sessionAttributes.repromptSpeech)
        .withSimpleCard(cardTitle, `${colour.red}, ${colour.green}, ${colour.blue}`);
        //.addRenderTemplateDirective(template);
      
      console.log('Response: ', response.getResponse());

      return response.getResponse();
    }
    else{
      console.log('Failure...');
      speakOutput = requestAttributes.t('FAILURE_MESSAGE');
      console.log('Failure speech output: ', speakOutput)
      sessionAttributes.speakOutput = speakOutput; //saving speakOutput to attributes, so we can use it to repeat
      console.log('Failure speech output attribute: ', sessionAttributes.speakOutput);
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      return handlerInput.responseBuilder
        .speak(sessionAttributes.speakOutput)
        .getResponse();
    }
  }
};

const PreviousIntentHandler = RandomColourHandler;


const HelpHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    sessionAttributes.speakOutput = requestAttributes.t('HELP_MESSAGE');
    sessionAttributes.repromptSpeech = requestAttributes.t('HELP_REPROMPT');

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

const RepeatHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent';
  },
  handle(handlerInput) {
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

    return handlerInput.responseBuilder
      .speak(sessionAttributes.speakOutput)
      .reprompt(sessionAttributes.repromptSpeech)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent'
                || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const speakOutput = requestAttributes.t('STOP_MESSAGE', requestAttributes.t('SKILL_NAME'));

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    console.log("Inside SessionEndedRequestHandler");
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    return handlerInput.responseBuilder.getResponse();
  },
};


const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

/* CONSTANTS */
const skillBuilder = Alexa.SkillBuilders.custom();
const languageStrings = {
  en: {
    translation: {
      SKILL_NAME: 'Colour Book',
      WELCOME_MESSAGE: 'Welcome to %s. You can get a colour by saying, fetch me a random colour ... Now, what can I help you with?',
      WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
      DISPLAY_CARD_TITLE: '%s  - Random Colour.',
      HELP_MESSAGE: 'You can make requests such as, fetch a random colour, or, you can say exit...Now, what can I help you with?',
      HELP_REPROMPT: 'You can say things like, random colour, or you can say exit...Now, what can I help you with?',
      STOP_MESSAGE: 'Goodbye!',
      COLOUR_REPEAT_MESSAGE: 'Try saying repeat.',
      FAILURE_MESSAGE: 'I\'m sorry, my muse has left me, please ask again later ',
      COLOUR_MESSAGE: 'How about <say-as interpret-as="spell-out">RGB</say-as> <say-as interpret-as="digits">%s</say-as>, <say-as interpret-as="digits">%s</say-as>, <prosody rate="x-slow"><say-as interpret-as="digits">%s</say-as></prosody>?',
      COLOUR_TEXT_MESSAGE: 'How about RGB %s, %s, %s?',
      COLOUR_TEXT_SECONDARY_MESSAGE: 'That looks good, right?',
    },
  },
  'en-US': {
    translation: {
      SKILL_NAME: 'Color Book',
      WELCOME_MESSAGE: 'Welcome to %s. You can get a color by saying, fetch me a random color ... Now, what can I help you with?',
      DISPLAY_CARD_TITLE: '%s  - Random Color.',
      HELP_MESSAGE: 'You can make requests such as, fetch a random color, or, you can say exit...Now, what can I help you with?',
      HELP_REPROMPT: 'You can say things like, random color, or you can say exit...Now, what can I help you with?'
    },
  },
  de: {
    translation: {
      SKILL_NAME: 'Farbbuch',
      WELCOME_MESSAGE: 'Willkommen bei %s. Du kannst beispielsweise die Frage stellen: Welche Rezepte gibt es für eine %s? ... Nun, womit kann ich dir helfen?',
      WELCOME_REPROMPT: 'Wenn du wissen möchtest, was du sagen kannst, sag einfach „Hilf mir“.',
      DISPLAY_CARD_TITLE: '%s - Rezept für %s.',
      HELP_MESSAGE: 'Du kannst beispielsweise Fragen stellen wie „Wie geht das Rezept für eine %s“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
      HELP_REPROMPT: 'Du kannst beispielsweise Sachen sagen wie „Wie geht das Rezept für eine %s“ oder du kannst „Beenden“ sagen ... Wie kann ich dir helfen?',
      STOP_MESSAGE: 'Auf Wiedersehen!',
      RECIPE_REPEAT_MESSAGE: 'Sage einfach „Wiederholen“.'
    },
  },
};

// Finding the locale of the user
const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageStrings,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};

/* LAMBDA SETUP */
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    RandomColourHandler,
    HelpHandler,
    RepeatHandler,
    ExitHandler,
    PreviousIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(LocalizationInterceptor)
  .addErrorHandlers(ErrorHandler)
  .lambda();
