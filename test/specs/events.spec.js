import spies from 'chai-spies';
import * as event from '../../src/utils/event';
chai.use(spies);

describe('Event', () => {
  const fakeCallBack = chai.spy();

  it('should call attachEvent when addEventListener does not exist', () => {
    document.addEventListener = null;
    var fakeAttachEvent = chai.spy();
    document.attachEvent = fakeAttachEvent;


    event.on(document, 'click', fakeCallBack);
    expect(fakeAttachEvent).to.be.called.once;
  });


  it('should call detachEvent when removeEventListener does not exist', () => {
    document.removeEventListener = null;
    var fakeDetachEvent = chai.spy();
    document.detachEvent = fakeDetachEvent;

    event.off(document, 'click', fakeCallBack);
    expect(fakeDetachEvent).to.be.called.once;
  });
});
