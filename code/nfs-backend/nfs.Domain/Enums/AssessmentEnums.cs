namespace NFS.Domain.Enums
{
    public enum AssessmentStatus
    {
        Pending = 0,
        InProgress = 1,
        Completed = 2,
        Reviewed = 3,
        Archived = 4
    }

    public enum AssessmentType
    {
        PHQ9 = 0,           // Patient Health Questionnaire-9 (Depression)
        GAD7 = 1,           // Generalized Anxiety Disorder-7
        PTSD = 2,           // PTSD Checklist
        Stress = 3,         // Perceived Stress Scale
        Sleep = 4,          // Sleep Quality Assessment
        Substance = 5,      // Substance Use Screening
        Eating = 6,         // Eating Disorder Assessment
        Personality = 7,    // Personality Assessment
        Cognitive = 8,      // Cognitive Assessment
        Other = 9           // Other Assessment Types
    }

    public enum SeverityLevel
    {
        None = 0,
        Mild = 1,
        Moderate = 2,
        Moderately_Severe = 3,
        Severe = 4
    }
}
