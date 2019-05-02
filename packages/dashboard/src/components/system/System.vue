<template>
  <div class="system">

    <div class="va-row">
      <div class="flex md12">
        <vuestic-widget :headerText="'forms.train.title' | translate">
          <form>

            <div class="va-row">
              <div class="flex md8" style="margin: auto;">
                <fieldset>
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
  name: 'system',
}
</script>
