const { create, persist, recall, exists, destroy, checkStatus } = require('./store.js');
const renderClient = require('../client');

const homeScreenText = `
quack-pad:
dead-simple collaborative QUACKpad
---

Click (+) or edit this page to create QUACKS
Send the link to QUACK EXCESSIVELY

Notes expire after 30 NOT QUACKING SESSIONS.

DUCKS RUN THE SHOW NOW
QUACK QUACK QUACK QUACK QUACK

   (@_
\\\\\\_\\
<____) 
`;

const noteNotFoundText = `
404: Note not found
---

The note at this address either has not been created or has been deleted.
Click (+) to create a new note.
`;

const pageNotFoundText = `
404: page not found
---

Oops! Nothing exists here.
`;


// TODO: use promises a little better than I'm doing right now
function configureRoutes(app){
  // root is read-only info page
  app.get('/', function(request, response) {
    response.send(renderClient({
      content: homeScreenText,
      interactionStyle: 'createOnEdit',
    }));
  });

  // new will redirect to the properly
  app.get('/new/', function(request, response) {
    create().then(
      (newId) => response.redirect(`/note/${newId}/`)
    );
  });

  app.get('/note/:id/', function(request, response) {
    const id = request.params.id;
    const autofocus = request.query.autofocus !== 'false';
    exists(id).then(
      doesExist => doesExist ? (
        recall(id).then(
          content => response.send(renderClient({
            content: content,
            title: 'QUACK-pad: note',
            noteId: id,
            interactionStyle: 'editable',
          }))
        )
      ) : (
        response.status(404).send(renderClient({
          content: noteNotFoundText,
          title: 'QUACK-pad: note not found',
        }))
      )
    )
  });

  app.post('/note/:id/', function(request, response){
    const id = request.params.id;
    persist(id, request.body.content || '').then(
      () => response.status(200).json({success: true})
    );
  });

  app.post('/statusCheck', function(request, response){
    const ids = request.body.ids;
    if(!Array.isArray(ids)){
      response.status(400).json({success: false});
      return;
    }
    if(ids.length > 1000){
      response.status(400).json({
        success: false,
        video: 'https://www.youtube.com/watch?v=Q5N_GPkSS6c',
      });
      return;
    }
    if (ids.length === 0) {
      response.status(200).json([]);
      return;
    }
    checkStatus(ids).then(
      statuses => response.status(200).json(statuses)
    );
  });

  app.get('*', function(request, response){
    response.status(404).send(renderClient({
      content: pageNotFoundText,
      title: 'quick-pad: page not found',
    }))
  });
}

module.exports = configureRoutes;
