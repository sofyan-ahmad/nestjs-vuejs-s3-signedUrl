<template>

  <div>
    <dropzone
      ref="product-image"
      v-model="tempProductData.image"
      :label="$t('table.image')"
      :signed-api="signedAPIRequest"
    />
    <el-button @click="uploadImage">Upload</el-button>
  </div>

</template>

<script lang="ts">
import { Component, Vue, Ref } from 'vue-property-decorator';
import Dropzone from '../../components/UploadImage/index.vue';

@Component({
  name: 'Product',
  components: {
    Dropzone
  },
  filters: {}
})
export default class extends Vue {
  @Ref('product-image') readonly dropzone!: Dropzone;

  signedAPIRequest: string = `{your lambad URL}/products/signedUrl`;

  imageUrl: string =''

  async uploadImage() {
    try {
      // upload image
      const url = await this.dropzone.submit();

      this.$notify({
        title: 'Success',
        message: 'Image uploaded into ' + url,
        type: 'success',
        duration: 2000
      });
    } catch (err) {
      this.$notify({
        title: 'Create Failed!',
        message:
          err.data?.error ||
          err.data ||
          err
        type: 'error',
        duration: 2000
      });
    }
  }

}
</script>
