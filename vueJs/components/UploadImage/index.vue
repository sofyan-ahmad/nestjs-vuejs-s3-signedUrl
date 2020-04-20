<template>
  <div class="upload-container">
    <el-upload
      v-show="!imageUrl"
      ref="uploadZone"
      class="image-uploader"
      drag
      :multiple="false"
      :show-file-list="false"
      :auto-upload="false"
      action=""
      :on-change="onChange"
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">
        Drop file here or <em>click to upload</em>
      </div>
    </el-upload>

    <div
      v-show="imageUrl && imageUrl.length > 1"
      class="image-preview"
    >
      <div class="image-preview-wrapper">
        <img :src="imageUrl" />
        <div class="image-preview-action">
          <i
            class="el-icon-delete"
            @click="removeImage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Ref } from 'vue-property-decorator';
import axios from 'axios';
import { ElUpload } from 'element-ui/types/upload';
import { getSignedURL } from '../../uploadApiClient';

@Component({
  name: 'UploadImage'
})
export default class extends Vue {
  @Prop({ required: true }) signedApi!: string;

  @Prop({ required: false }) value!: string;

  @Ref('uploadZone') readonly uploadComponent!: ElUpload;

  file?: File;

  signedUrl?: string;

  get imageUrl(): string {
    return this.value;
  }

  removeImage() {
    this.file = undefined;
    this.$emit('input', undefined);
  }

  onChange({ raw }: { raw: File }) {
    this.file = raw;

    this.$emit('input', URL.createObjectURL(this.file));
  }

  async submit(): Promise<string> {
    if (this.file) {
      const { s3Url, fileName } = await getSignedURL(this.signedApi, this.file);

      this.signedUrl = s3Url;

      this.file = new File([this.file], fileName, { type: this.file.type });

      const url = this.signedUrl.split('?')[0];

      await axios.put(this.signedUrl, this.file, {
        headers: {
          'Content-Type': this.file.type
        }
      });

      this.$emit('input', url);

      return url;
    }

    throw Error('No file selected');
  }
}
</script>

<style lang="scss" scoped>
.upload-container {
  width: 100%;
  position: relative;
  @include clearfix;
  .image-uploader {
    float: left;
  }
  .image-preview {
    width: 200px;
    height: 200px;
    position: relative;
    border: 1px dashed #d9d9d9;
    float: left;
    .image-preview-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .image-preview-action {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, 0.5);
      transition: opacity 0.3s;
      cursor: pointer;
      text-align: center;
      line-height: 200px;
      .el-icon-delete {
        font-size: 36px;
      }
    }
    &:hover {
      .image-preview-action {
        opacity: 1;
      }
    }
  }
}
</style>
