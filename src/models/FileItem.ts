import mongoose, { Schema, Model } from 'mongoose';

export interface ISharedWith {
  userId: mongoose.Types.ObjectId;
  permission: 'view' | 'edit';
}

export interface ISharedLink {
  token: string;
  permission: 'view' | 'edit';
  expiresAt?: Date;
  password?: string;
}

export interface IFileItem {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: string;
  path: string;
  parentId?: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  isFolder: boolean;
  size: number;
  url?: string;
  sharedWith: ISharedWith[];
  sharedLink?: ISharedLink;
  isDeleted: boolean;
  deletedAt?: Date;
  starred: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FileItemSchema = new Schema<IFileItem>(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'FileItem',
      default: null,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isFolder: {
      type: Boolean,
      default: false,
    },
    size: {
      type: Number,
      default: 0,
    },
    url: {
      type: String,
      default: '',
    },
    sharedWith: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        permission: {
          type: String,
          enum: ['view', 'edit'],
        },
      },
    ],
    sharedLink: {
      token: String,
      permission: {
        type: String,
        enum: ['view', 'edit'],
      },
      expiresAt: Date,
      password: String,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    starred: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 索引优化
FileItemSchema.index({ ownerId: 1, isDeleted: 1 });
FileItemSchema.index({ parentId: 1, isDeleted: 1 });
FileItemSchema.index({ ownerId: 1, starred: 1, isDeleted: 1 });

const FileItem: Model<IFileItem> =
  mongoose.models.FileItem || mongoose.model<IFileItem>('FileItem', FileItemSchema);

export default FileItem;

