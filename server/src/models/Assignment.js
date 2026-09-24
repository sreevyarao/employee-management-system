import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required']
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required']
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    role: {
      type: String,
      trim: true,
      default: 'Team Member'
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'released'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// RACE-CONDITION GUARD: Partial unique index on employee where status = 'active'
// This is a MongoDB-level atomic constraint. Even if two concurrent POST requests
// both pass the application-level findOne check, only one can win the write.
// The second write throws E11000 → errorMiddleware converts it to 409 Conflict.
// ──────────────────────────────────────────────────────────────────────────────
assignmentSchema.index(
  { employee: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'active' },
    name: 'unique_active_employee_assignment'
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
