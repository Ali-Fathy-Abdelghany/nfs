using System.Collections.Generic;
using NafsApp.Enums;
namespace NafsApp.Models
{
    public class Notification
    {
        public int NotificationId { get; set; }
        public int  UserId { get; set; } 
    
        public string Content { get; set; } 
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public NotificationType Type { get; set; }
        public int? RelatedId { get; set; }
        public User? User { get; set; }
       

}}