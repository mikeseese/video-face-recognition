<template>
  <div class="train">
    <div class="va-row">
      <div class="flex md12">
        <vuestic-widget :headerText="'forms.gather.title' | translate">
          <form>

            <div class="va-row">
              <div class="flex md8" style="margin: auto;">
                <fieldset>
                  <p>
                    Enter a name for the new identity and press the button to
                    create a new identity. This will stop the VFR system from
                    gathering access logs and enter into "Gather" mode.<br />
                    <br />
                    <span style="font-weight: 600;">1.</span> Before pressing the button,
                    make sure only one face is in the view of the camera.<br />
                    <span style="font-weight: 600;">2.</span> After pushing the button,
                    the terminal of the VFR system will show the camera feed with a
                    red box around the face detected.<br />
                    <span style="font-weight: 600;">3.</span> Have the person move their
                    face slowly in all directions, the more variation and quantity of
                    images the better. If the person wears glasses, gather images both
                    with and without the glasses.<br />
                    <span style="font-weight: 600;">4.</span> When finished, press the
                    <span style="font-weight: 600;">Q</span> key on the keyboard.<br />
                    <span style="font-weight: 600;">5.</span> You may now continue to
                    add as many identities as you want. Once you're done, see the below
                    section about training the VFR system with the new identities.<br />
                  </p>
                  <div class="form-group form-group-w-btn">
                    <div class="input-group">
                      <input id="input-w-btn" required/>
                      <label class="control-label" for="input-w-btn">{{'forms.gather.name'
                        | translate}}</label><i class="bar"></i>
                    </div>
                    <div class="btn btn-micro btn-primary">
                      <strong>{{'forms.gather.button' | translate}}</strong>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </form>
        </vuestic-widget>
      </div>
    </div>

    <div class="va-row">
      <div class="flex md12">
        <vuestic-widget :headerText="'forms.train.title' | translate">
          <form>

            <div class="va-row">
              <div class="flex md8" style="margin: auto;">
                <fieldset>
                  <p>
                    Pressing the button below will start training the VFR
                    system to use the additional faces in the classification
                    system. This will take several minutes, and will take longer
                    as more identities are entered into the system.<br />
                    <br />
                    The VFR system will resume normal detection once the training
                    has completed.
                  </p>
                  <div class="form-group form-group-w-btn">
                    <div class="btn btn-micro btn-primary" style="margin: auto;">
                      <strong>{{'forms.train.button' | translate}}</strong>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>

          </form>
        </vuestic-widget>
      </div>
    </div>

  </div>
</template>

<script>
export default {
  name: 'train',
}
</script>
