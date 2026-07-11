using MongoDB.Driver;
using NFS.Chat.Models;
using NFS.Chat.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NFS.Chat
{
    public static class ChatSeeder
    {
        /// <summary>
        /// Seeds sample chat messages into MongoDB for the first two seeded users
        /// (patient UserId=1, therapist UserId=2) and the default group rooms.
        /// Safe to call repeatedly — skips seeding if messages already exist.
        /// </summary>
        public static async Task SeedAsync(IChatRepository chatRepository, IMongoDatabase mongoDatabase)
        {
            await SeedRoomsAsync(chatRepository, mongoDatabase);

            var collection = mongoDatabase.GetCollection<ChatMessage>("ChatMessages");

            // Skip if any messages already exist
            var count = await collection.CountDocumentsAsync(FilterDefinition<ChatMessage>.Empty);
            if (count > 0)
                return;

            // UserId values match the SQL seeder (auto-increment starts at 1)
            var patientId   = "1";   // patient@test.com
            var therapistId = "2";   // therapist@test.com

            var now = DateTime.UtcNow;

            // ── Group room messages ───────────────────────────────────────────

            var groupMessages = new List<ChatMessage>
            {
                // room_1 — مساحة الهدوء
                new ChatMessage
                {
                    RoomId    = "room_1",
                    SenderId  = therapistId,
                    Content   = "أهلاً بالجميع في مساحة الهدوء 🌿 هذه مساحة آمنة للتعبير عن مشاعركم.",
                    Timestamp = now.AddMinutes(-60)
                },
                new ChatMessage
                {
                    RoomId    = "room_1",
                    SenderId  = patientId,
                    Content   = "شكراً دكتور! أشعر أن هذا المكان مريح جداً.",
                    Timestamp = now.AddMinutes(-55)
                },
                new ChatMessage
                {
                    RoomId    = "room_1",
                    SenderId  = therapistId,
                    Content   = "هذا رائع. تذكر دائماً أن مشاعرك صحيحة وطبيعية. 💙",
                    Timestamp = now.AddMinutes(-50)
                },
                new ChatMessage
                {
                    RoomId    = "room_1",
                    SenderId  = patientId,
                    Content   = "جربت تمرين التنفس العميق اليوم وساعدني كثيراً.",
                    Timestamp = now.AddMinutes(-20)
                },
                new ChatMessage
                {
                    RoomId    = "room_1",
                    SenderId  = therapistId,
                    Content   = "ممتاز جداً! الاستمرارية هي المفتاح. 🔑",
                    Timestamp = now.AddMinutes(-15)
                },

                // room_2 — دعم القلق الصباحي
                new ChatMessage
                {
                    RoomId    = "room_2",
                    SenderId  = patientId,
                    Content   = "صباح الخير، كل صباح أشعر بقلق غير مبرر قبل بدء يومي.",
                    Timestamp = now.AddHours(-3)
                },
                new ChatMessage
                {
                    RoomId    = "room_2",
                    SenderId  = therapistId,
                    Content   = "صباح النور. ما تصفه شائع جداً ويُعرف بـ'قلق الاستيقاظ'. جرّب كتابة ثلاثة أشياء تشعر بالامتنان لها فور استيقاظك.",
                    Timestamp = now.AddHours(-2).AddMinutes(-50)
                },
                new ChatMessage
                {
                    RoomId    = "room_2",
                    SenderId  = patientId,
                    Content   = "سأجرب ذلك غداً وأخبرك بالنتيجة. شكراً جزيلاً!",
                    Timestamp = now.AddHours(-2).AddMinutes(-45)
                },

                // room_3 — تأملات جماعية
                new ChatMessage
                {
                    RoomId    = "room_3",
                    SenderId  = therapistId,
                    Content   = "مرحباً بالجميع في جلسة التأمل الصباحية. لنبدأ بثلاث أنفاس عميقة معاً. 🧘‍♀️",
                    Timestamp = now.AddHours(-5)
                },
                new ChatMessage
                {
                    RoomId    = "room_3",
                    SenderId  = patientId,
                    Content   = "جاهز! هذه الجلسات تعطيني طاقة إيجابية لبقية اليوم.",
                    Timestamp = now.AddHours(-4).AddMinutes(-55)
                },
                new ChatMessage
                {
                    RoomId    = "room_3",
                    SenderId  = therapistId,
                    Content   = "رائع. ركّز على اللحظة الحالية فقط، وتجاهل كل ما عداها. 🌅",
                    Timestamp = now.AddHours(-4).AddMinutes(-50)
                },
            };

            // ── Private DM messages between patient & therapist ───────────────

            // Private room ID is deterministic: private_{lower}_{higher}
            var privateRoomId = string.CompareOrdinal(patientId, therapistId) < 0
                ? $"private_{patientId}_{therapistId}"
                : $"private_{therapistId}_{patientId}";

            var privateMessages = new List<ChatMessage>
            {
                new ChatMessage
                {
                    RoomId      = privateRoomId,
                    SenderId    = patientId,
                    RecipientId = therapistId,
                    Content     = "مرحباً دكتور، أريد أن أستشيرك في موضوع شخصي.",
                    Timestamp   = now.AddHours(-1).AddMinutes(-30)
                },
                new ChatMessage
                {
                    RoomId      = privateRoomId,
                    SenderId    = therapistId,
                    RecipientId = patientId,
                    Content     = "أهلاً، بالطبع. أنا هنا للمساعدة. ما الذي يشغل تفكيرك؟",
                    Timestamp   = now.AddHours(-1).AddMinutes(-25)
                },
                new ChatMessage
                {
                    RoomId      = privateRoomId,
                    SenderId    = patientId,
                    RecipientId = therapistId,
                    Content     = "أعاني من صعوبة في النوم في الفترة الأخيرة، وأشعر بتوتر مستمر.",
                    Timestamp   = now.AddHours(-1).AddMinutes(-20)
                },
                new ChatMessage
                {
                    RoomId      = privateRoomId,
                    SenderId    = therapistId,
                    RecipientId = patientId,
                    Content     = "فهمت. اضطرابات النوم غالباً ما تكون مرتبطة بالتوتر. سنتحدث عن تقنيات الاسترخاء في جلستنا القادمة. حاول في الوقت الحالي تجنب الشاشات قبل النوم بساعة.",
                    Timestamp   = now.AddHours(-1).AddMinutes(-15)
                },
                new ChatMessage
                {
                    RoomId      = privateRoomId,
                    SenderId    = patientId,
                    RecipientId = therapistId,
                    Content     = "حسناً سأجرب ذلك. شكراً لك دكتور! 🙏",
                    Timestamp   = now.AddHours(-1).AddMinutes(-10)
                },
            };

            // Insert all messages
            var allMessages = new List<ChatMessage>();
            allMessages.AddRange(groupMessages);
            allMessages.AddRange(privateMessages);

            await collection.InsertManyAsync(allMessages);

            Console.WriteLine($"[ChatSeeder] ✅ Seeded {allMessages.Count} chat messages into MongoDB.");
        }

        private static async Task SeedRoomsAsync(IChatRepository chatRepository, IMongoDatabase mongoDatabase)
        {
            var roomsCollection = mongoDatabase.GetCollection<ChatRoom>("ChatRooms");
            var roomCount = await roomsCollection.CountDocumentsAsync(FilterDefinition<ChatRoom>.Empty);
            if (roomCount > 0)
                return;

            var defaultRooms = new List<ChatRoom>
            {
                new ChatRoom
                {
                    Id = "room_1",
                    Name = "مساحة الهدوء",
                    Description = "مساحة لمشاركة الدعم الهادئ والتفريغ عن الضغوط.",
                    Avatar = "🦊",
                    CreatedBy = "2",
                    MemberIds = new List<string> { "1", "2" },
                    CreatedAt = DateTime.UtcNow.AddDays(-30)
                },
                new ChatRoom
                {
                    Id = "room_2",
                    Name = "دعم القلق الصباحي",
                    Description = "مساحة مخصصة للحديث عن نوبات وتحديات القلق الصباحي.",
                    Avatar = "🐨",
                    CreatedBy = "2",
                    MemberIds = new List<string> { "1", "2" },
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                },
                new ChatRoom
                {
                    Id = "room_3",
                    Name = "تأملات جماعية",
                    Description = "جلسات تأمل جماعية للراحة النفسية والصفاء الذهني.",
                    Avatar = "🐼",
                    CreatedBy = "2",
                    MemberIds = new List<string> { "2" },
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            await roomsCollection.InsertManyAsync(defaultRooms);
            Console.WriteLine($"[ChatSeeder] ✅ Seeded {defaultRooms.Count} chat rooms into MongoDB.");
        }
    }
}
