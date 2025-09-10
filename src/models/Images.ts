import mongoose, { Schema, Document } from 'mongoose';

interface Transformation {
    type: string;
    parameters: any;
    resultPath: string;
    processedAt: Date;
}

interface ImageDocument extends Document {
    filename: string;
    originalName: string;
    size: number;
    format: string;
    dimensions: { width: number; height: number };
    path: string;
    s3Url?: string;
    user: mongoose.Types.ObjectId;
    transformations: Transformation[];
}

const transformationSchema = new Schema({
    type: {
        type: String,
        required: true,
    },
    parameters: {
        // type: Object,
        type: Schema.Types.Mixed, // using this instead of Object for flexible data - it is better
        required: true,
    },
    resultPath: {
        type: String,
        required: true,
    },
    processedAt: {
        type: Date,
        default: Date.now, // it would auto set when transformation is created
    },
});

const imageSchema = new Schema({
    filename: {
        type: String,
        required: true,
    },
    originalName: {
        type: String,
        required: true,
    },
    format: {
        type: String,
        required: true,
    },
    dimensions: {
        width: {
            type: Number,
            required: true,
        },
        height: {
            type: Number,
            required: true,
        },
    },
    path: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    s3Url: {
        type: String,
        required: false, // only required when using S3 storage
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    transformations: {
        type: [transformationSchema],
        default: [], // i added this to ensure the transformations array is always an array - also optional as i have removed the required: true bs
    },
}, { timestamps: true }); // i added this to automatically add createdAt and updatedAt fields to the schema so timestamp is added for the image

const Image = mongoose.model<ImageDocument>('Image', imageSchema);

export default mongoose.model<ImageDocument>('Image', imageSchema); // i exported the image model using mongoose.model