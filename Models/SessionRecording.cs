using System;
using System.Collections.Generic;
using NafsApp.Enums;
namespace NafsApp.Models
{
    public class SessionRecording
    {
        public int RecordID { get; set; }
        public int SessionId { get; set; }
        public string? FileURL { get; set; }
        public bool IsEncrypted { get; set; }
        public int FileSize { get; set; }
        public int DurationInMinutes { get; set; }
        public int MaxCapacity { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public Session? Session { get; set; }

    }
}