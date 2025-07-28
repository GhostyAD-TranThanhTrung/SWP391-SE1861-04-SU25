USE [master]
GO
/****** Object:  Database [SWP391-demo]    Script Date: 11/07/2025 19:55:04 ******/
CREATE DATABASE [SWP391-demo]
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [SWP391-demo].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [SWP391-demo] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [SWP391-demo] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [SWP391-demo] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [SWP391-demo] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [SWP391-demo] SET ARITHABORT OFF 
GO
ALTER DATABASE [SWP391-demo] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [SWP391-demo] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [SWP391-demo] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [SWP391-demo] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [SWP391-demo] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [SWP391-demo] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [SWP391-demo] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [SWP391-demo] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [SWP391-demo] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [SWP391-demo] SET  DISABLE_BROKER 
GO
ALTER DATABASE [SWP391-demo] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [SWP391-demo] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [SWP391-demo] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [SWP391-demo] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [SWP391-demo] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [SWP391-demo] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [SWP391-demo] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [SWP391-demo] SET RECOVERY FULL 
GO
ALTER DATABASE [SWP391-demo] SET  MULTI_USER 
GO
ALTER DATABASE [SWP391-demo] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [SWP391-demo] SET DB_CHAINING OFF 
GO
ALTER DATABASE [SWP391-demo] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [SWP391-demo] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [SWP391-demo] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [SWP391-demo] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
EXEC sys.sp_db_vardecimal_storage_format N'SWP391-demo', N'ON'
GO
ALTER DATABASE [SWP391-demo] SET QUERY_STORE = ON
GO
ALTER DATABASE [SWP391-demo] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [SWP391-demo]
GO
/****** Object:  Table [dbo].[Action]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Action](
	[action_id] [int] IDENTITY(1,1) NOT NULL,
	[description] [nvarchar](max) NULL,
	[range] [int] NULL,
	[type] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[action_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Assessments]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Assessments](
	[assessment_id] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NULL,
	[type] [nvarchar](50) NULL,
	[result_json] [nvarchar](max) NULL,
	[create_at] [datetime] NULL,
	[action_id] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[assessment_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Blogs]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Blogs](
	[blog_id] [int] IDENTITY(1,1) NOT NULL,
	[author_id] [int] NULL,
	[title] [nvarchar](255) NULL,
	[body] [nvarchar](max) NULL,
	[created_at] [datetime] NULL,
	[status] [nvarchar](50) NULL,
	[img_link] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[blog_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Booking_Session]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Booking_Session](
	[booking_id] [int] IDENTITY(1,1) NOT NULL,
	[consultant_id] [int] NULL,
	[member_id] [int] NULL,
	[slot_id] [int] NULL,
	[booking_date] [date] NOT NULL,
	[status] [nvarchar](20) NULL,
	[notes] [nvarchar](max) NULL,
	[google_meet_link] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[booking_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Category]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Category](
	[category_id] [int] IDENTITY(1,1) NOT NULL,
	[name] [nvarchar](255) NULL,
	[description] [nvarchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[category_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Consultant]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Consultant](
	[id_consultant] [int] IDENTITY(1,1) NOT NULL,
	[user_id] [int] NOT NULL UNIQUE,
	[google_meet_link] [nvarchar](max) NULL,
	[certification] [nvarchar](max) NULL,
	[speciality] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_consultant] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Consultant_Slot]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Consultant_Slot](
	[consultant_id] [int] NOT NULL,
	[slot_id] [int] NOT NULL,
	[day_of_week] [nvarchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[consultant_id] ASC,
	[slot_id] ASC,
	[day_of_week] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Content]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Content](
	[content_id] [int] IDENTITY(1,1) NOT NULL,
	[program_id] [int] NULL,
	[title] [nvarchar](255) NULL,
	[type] [nvarchar](50) NULL,
	[orders] [int] NULL,
	[content_file_link] [nvarchar](max) NULL,
	[content_type] [nvarchar](50) NULL,
	[content_metadata_json] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[content_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Enroll]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Enroll](
	[user_id] [int] NOT NULL,
	[program_id] [int] NOT NULL,
	[start_at] [datetime] NULL,
	[complete_at] [datetime] NULL,
	[progress] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC,
	[program_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Flags]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Flags](
	[flag_id] [int] IDENTITY(1,1) NOT NULL,
	[blog_id] [int] NULL,
	[flagged_by] [int] NULL,
	[reason] [nvarchar](255) NULL,
	[created_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[flag_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Profile]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Profile](
	[user_id] [int] NOT NULL,
	[name] [nvarchar](100) NULL,
	[bio_json] [nvarchar](max) NULL,
	[date_of_birth] [date] NULL,
	[job] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Programs]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Programs](
	[program_id] [int] IDENTITY(1,1) NOT NULL,
	[img_link] [nvarchar](max) NULL,
	[title] [nvarchar](255) NULL,
	[description] [nvarchar](max) NULL,
	[create_by] [int] NULL,
	[status] [nvarchar](50) NULL,
	[age_group] [nvarchar](50) NULL,
	[create_at] [datetime] NULL,
	[category_id] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[program_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Slot]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Slot](
	[slot_id] [int] IDENTITY(1,1) NOT NULL,
	[start_time] [time](7) NOT NULL,
	[end_time] [time](7) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[slot_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Survey_Responses]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Survey_Responses](
	[response_id] [int] IDENTITY(1,1) NOT NULL,
	[survey_id] [int] NULL,
	[user_id] [int] NULL,
	[answer_json] [nvarchar](max) NULL,
	[submitted_at] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[response_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Surveys]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Surveys](
	[survey_id] [int] IDENTITY(1,1) NOT NULL,
	[program_id] [int] NULL,
	[type] [nvarchar](50) NULL,
	[questions_json] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[survey_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 11/07/2025 19:55:04 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[user_id] [int] IDENTITY(1,1) NOT NULL,
	[img_link] [nvarchar](max) NULL,
	[date_create] [datetime] NOT NULL,
	[role] [nvarchar](50) NOT NULL,
	[password] [nvarchar](255) NOT NULL,
	[status] [nvarchar](50) NOT NULL,
	[email] [nvarchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET IDENTITY_INSERT [dbo].[Action] ON 

INSERT [dbo].[Action] ([action_id], [description], [range], [type]) VALUES (1, N'Đánh giá hoàn tất - Chuyển đến tài nguyên phù hợp', 10000000, N'Referral')
INSERT [dbo].[Action] ([action_id], [description], [range], [type]) VALUES (2, N'Giáo dục ngắn gọn - Thông tin cho bệnh nhân về rủi ro của việc sử dụng ma túy bất hợp pháp và dấu hiệu rối loạn sử dụng chất', 0, N'ASSIST')
INSERT [dbo].[Action] ([action_id], [description], [range], [type]) VALUES (3, N'Can thiệp ngắn gọn - Thảo luận tập trung vào bệnh nhân sử dụng khái niệm Phỏng vấn Tạo động lực để nâng cao nhận thức về sử dụng chất và tăng cường động lực thay đổi', 4, N'ASSIST')
INSERT [dbo].[Action] ([action_id], [description], [range], [type]) VALUES (4, N'Can thiệp ngắn gọn (đề xuất các lựa chọn bao gồm điều trị) - Nếu bệnh nhân sẵn sàng chấp nhận điều trị, giới thiệu là quá trình chủ động tạo điều kiện tiếp cận chăm sóc chuyên sâu', 27, N'ASSIST')
INSERT [dbo].[Action] ([action_id], [description], [range], [type]) VALUES (5, N'Rủi ro thấp - Cung cấp thông tin về rủi ro sử dụng chất; khen ngợi và khuyến khích', 0, N'CRAFFT')
INSERT [dbo].[Action] ([action_id], [description], [range], [type]) VALUES (6, N'Rủi ro trung bình - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; có thể theo dõi', 1, N'CRAFFT')
INSERT [dbo].[Action] ([action_id], [description], [range], [type]) VALUES (7, N'Rủi ro cao - Cung cấp thông tin về rủi ro sử dụng chất; lời khuyên ngắn gọn; theo dõi; có thể giới thiệu tư vấn/điều trị', 2, N'CRAFFT')
SET IDENTITY_INSERT [dbo].[Action] OFF
GO
SET IDENTITY_INSERT [dbo].[Blogs] ON 

INSERT [dbo].[Blogs] ([blog_id], [author_id], [title], [body], [created_at], [status], [img_link]) VALUES (1, 1, N'Hello world', N'<p>Hello everyone, pls keep thing simple</p>', CAST(N'2025-07-11T19:26:35.000' AS DateTime), N'published', NULL)
SET IDENTITY_INSERT [dbo].[Blogs] OFF
GO
SET IDENTITY_INSERT [dbo].[Category] ON 

INSERT [dbo].[Category] ([category_id], [name], [description]) VALUES (1, N'Khoa học nghiện', N'Nội dung giáo dục khám phá nền tảng khoa học của nghiện, hóa học não và tác động thần kinh')
INSERT [dbo].[Category] ([category_id], [name], [description]) VALUES (2, N'Phòng tránh nghiện', N'Những dấu hiệu nghiện và cách phòng tránh')
INSERT [dbo].[Category] ([category_id], [name], [description]) VALUES (3, N'Sự kiện cộng đồng', N'Sự kiện dựa vào cộng đồng, hội thảo và hoạt động thúc đẩy nhận thức phòng ngừa ma túy và hỗ trợ nỗ lực phục hồi')
SET IDENTITY_INSERT [dbo].[Category] OFF
GO
SET IDENTITY_INSERT [dbo].[Content] ON 

INSERT [dbo].[Content] ([content_id], [program_id], [title], [type], [orders], [content_file_link], [content_type], [content_metadata_json]) VALUES (1, 1, N'Cách ma túy ảnh hưởng đến não bộ', N'markdown', 1, N'# Giới thiệu về Bộ Não Con Người

![Hình ảnh: Hình bóng đầu người với sóng âm phát ra và tiếp nhận vào tai](https://nida.nih.gov/sites/default/files/styles/content_image_medium/public/images/soa_brain_cell_communication.jpg?itok=M6fJLgvW)

Bộ não con người là cơ quan phức tạp nhất trong cơ thể. Khối chất xám và trắng nặng khoảng 1,3kg này nằm ở trung tâm của mọi hoạt động – bạn cần nó để lái xe, thưởng thức bữa ăn, thở, sáng tạo nghệ thuật, và tận hưởng các hoạt động hàng ngày. Bộ não điều khiển các chức năng cơ bản của cơ thể, cho phép bạn diễn giải và phản ứng với mọi trải nghiệm, đồng thời định hình hành vi của bạn. Tóm lại, **bộ não chính là bạn** – mọi suy nghĩ, cảm xúc và con người bạn là nhờ nó.

---

## Bộ não hoạt động như thế nào?

Bộ não thường được ví như một máy tính cực kỳ phức tạp và tinh vi. Thay vì mạch điện như trong chip silicon của thiết bị điện tử, bộ não bao gồm hàng tỷ tế bào gọi là **nơron**, được tổ chức thành các mạch và mạng lưới. Mỗi nơron hoạt động như một công tắc điều khiển dòng thông tin. Nếu nó nhận đủ tín hiệu từ các nơron khác, nó sẽ phát tín hiệu của mình đến các nơron tiếp theo.

Bộ não có nhiều phần kết nối với nhau, hoạt động như một nhóm. Các mạch não khác nhau chịu trách nhiệm phối hợp và thực hiện các chức năng cụ thể. Các mạng lưới nơron gửi tín hiệu qua lại giữa các phần của não, tủy sống và hệ thần kinh ngoại biên.

Khi gửi tín hiệu, nơron sẽ giải phóng một **chất dẫn truyền thần kinh (neurotransmitter)** vào khoảng trống (synapse) giữa nó và tế bào kế tiếp. Chất này sẽ gắn vào **thụ thể** (receptor) ở tế bào nhận, giống như chìa khóa cắm vào ổ khóa, gây ra thay đổi trong tế bào đó. Một số phân tử khác gọi là **chất vận chuyển (transporter)** sẽ tái hấp thu các chất dẫn truyền này, giúp ngắt hoặc điều chỉnh tín hiệu.

---

## Ma túy tác động thế nào lên não?

![Hình: Mô tả quá trình truyền dẫn giữa các nơron và chất dẫn truyền]

Ma túy can thiệp vào quá trình gửi, nhận và xử lý tín hiệu thần kinh qua chất dẫn truyền. Một số loại như **cần sa** hoặc **heroin** bắt chước chất dẫn truyền tự nhiên và kích hoạt nơron. Tuy nhiên, chúng hoạt động không giống như chất tự nhiên, dẫn đến **tín hiệu bất thường** trong mạng lưới thần kinh.

Một số loại khác như **amphetamine** hay **cocaine** khiến nơron giải phóng lượng lớn chất dẫn truyền hoặc **ngăn chặn quá trình tái hấp thu**, khiến tín hiệu thần kinh bị cường điệu hoặc rối loạn.

---

## Những vùng nào của não bị ảnh hưởng?

![Hình: Các vùng não - hạch nền, hạch hạnh nhân mở rộng, vỏ não trước trán](https://nida.nih.gov/sites/default/files/styles/content_image_medium/public/brainimage.gif?itok=DUA7jyZP)

Ma túy có thể làm thay đổi các vùng não quan trọng phục vụ sự sống và thúc đẩy hành vi sử dụng ma túy mang tính cưỡng chế. Các vùng bị ảnh hưởng gồm:

- **Hạch nền (Basal ganglia)**: Điều khiển động lực tích cực và khoái cảm từ ăn uống, xã giao, tình dục. Đây là trung tâm của "mạch tưởng thưởng" của não. Ma túy kích hoạt quá mức vùng này, tạo cảm giác "phê". Về lâu dài, vùng này giảm độ nhạy, khiến người dùng không còn cảm nhận được niềm vui từ hoạt động lành mạnh.

- **Hạch hạnh nhân mở rộng (Extended amygdala)**: Liên quan đến cảm xúc tiêu cực như lo âu, cáu gắt trong giai đoạn cai. Người nghiện dùng ma túy để tránh cảm giác khó chịu hơn là để cảm thấy "phê".

- **Vỏ não trước trán (Prefrontal cortex)**: Điều khiển suy nghĩ, lập kế hoạch, kiểm soát xung động. Đây là vùng phát triển muộn nhất, khiến thanh thiếu niên dễ bị tổn thương. Mất cân bằng giữa vùng này với các vùng khác dẫn đến mất khả năng kiềm chế hành vi nghiện.

- **Thân não** (bị ảnh hưởng bởi thuốc phiện): Điều khiển nhịp tim, hô hấp, giấc ngủ. Khi bị rối loạn có thể gây **suy hô hấp** và **tử vong**.

---

## Ma túy tạo khoái cảm như thế nào?

![Hình: Nhóm người trưởng thành cười đùa vui vẻ](data:image/jpeg;base64,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)

Hoạt động hàng ngày như ăn uống hay nghe nhạc tạo ra những **đợt phóng thích nhỏ chất dẫn truyền thần kinh**, mang lại khoái cảm nhẹ nhàng. Ma túy **chiếm quyền kiểm soát** quá trình này.

Cảm giác "phê" có thể liên quan đến các **chất nội sinh như endorphin** và các chất dẫn truyền khác trong **mạch tưởng thưởng**. Khi dùng ma túy, lượng chất dẫn truyền tăng vọt hơn nhiều lần so với phần thưởng tự nhiên như nghe nhạc hay giao tiếp.

Trước đây, người ta nghĩ **dopamine** gây ra cảm giác "phê", nhưng nay cho rằng nó **có vai trò củng cố hành vi lặp lại** hơn là trực tiếp tạo khoái cảm.

---

## Dopamine củng cố hành vi sử dụng ma túy như thế nào?

Cảm giác dễ chịu giúp não ghi nhớ và lặp lại hành vi có lợi như ăn, xã giao. **Dopamine** đóng vai trò trung tâm trong việc ghi nhớ và lặp lại này.

Mỗi khi có trải nghiệm tích cực, dopamine sẽ phát tín hiệu cho biết "việc này quan trọng cần nhớ". Điều này tạo **kết nối thần kinh mới**, khiến việc lặp lại hành vi đó dễ hơn – hình thành **thói quen**.

Ma túy tạo ra **lượng dopamine vượt trội**, khiến não học cách **ưu tiên ma túy hơn mọi thứ khác**.

Các tín hiệu môi trường liên quan đến việc sử dụng ma túy (địa điểm, người quen, đồ vật...) có thể gây **thèm ma túy dữ dội**, ngay cả khi người đó đã cai nghiện nhiều năm. Não bộ **ghi nhớ lâu dài**, như việc "biết đi xe đạp".

---

## Tại sao ma túy gây nghiện mạnh hơn phần thưởng tự nhiên?

So sánh phần thưởng tự nhiên với ma túy giống như **thì thầm vào tai** với **gào vào micro**.

Khi bị kích thích quá mức bởi ma túy, não phản ứng bằng cách **giảm sản xuất dopamine** hoặc **giảm thụ thể dopamine**. Điều này làm giảm khả năng cảm nhận niềm vui từ hoạt động bình thường.

Người nghiện dần trở nên **vô cảm, trầm cảm, thiếu động lực** và cần dùng ma túy chỉ để cảm thấy "bình thường". Tình trạng này khiến họ **tăng liều** để đạt hiệu ứng cũ – gọi là **dung nạp** – tạo ra **vòng luẩn quẩn** của nghiện ngập ngày càng nặng hơn.

---
', N'markdown', N'{"author":"Admin","readingTime":"5 min","difficulty":"beginner"}')
INSERT [dbo].[Content] ([content_id], [program_id], [title], [type], [orders], [content_file_link], [content_type], [content_metadata_json]) VALUES (2, 1, N'Quá trình hình thành nghiện', N'video', 2, N'https://www.youtube.com/watch?app=desktop&v=PSafk5fUx2I', N'video', N'{"author":"Admin","readingTime":"5 min","difficulty":"beginner"}')
INSERT [dbo].[Content] ([content_id], [program_id], [title], [type], [orders], [content_file_link], [content_type], [content_metadata_json]) VALUES (3, 2, N'Treatment and Recovery', N'markdown', 1, N'# 📘 Điều Trị Nghiện Ma Túy: Những Điều Cần Biết

## Nghiện có thể điều trị thành công không?

✅ **Có**, nghiện là một rối loạn có thể điều trị được. Nghiên cứu về khoa học nghiện và điều trị rối loạn sử dụng chất đã dẫn đến sự phát triển của nhiều phương pháp dựa trên bằng chứng, giúp người bệnh ngừng sử dụng ma túy và quay trở lại cuộc sống hiệu quả – còn gọi là **trạng thái hồi phục**.

## Nghiện có thể chữa khỏi hoàn toàn không?

🔁 Tương tự như bệnh tim hay hen suyễn, **điều trị nghiện không phải là chữa khỏi**, mà là quản lý bệnh. Điều trị giúp người bệnh đối phó với các tác động gây rối loạn của nghiện lên não và hành vi, từ đó lấy lại quyền kiểm soát cuộc sống.

![Hình ảnh: So sánh mật độ vận chuyển dopamine ở não người cai nghiện methamphetamine sau 1 tháng, 14 tháng, và não khỏe mạnh.](https://nida.nih.gov/sites/default/files/styles/content_image_large/public/methbrain.gif?itok=QVi9TG6I)

**Nguồn**: *The Journal of Neuroscience, 21(23):9414–9418, 2001*  
Hình ảnh cho thấy **não có khả năng hồi phục một phần** sau một thời gian dài kiêng ma túy (trường hợp sử dụng methamphetamine).

## Tái nghiện có đồng nghĩa với điều trị thất bại?

🚫 **Không**. Nghiện là một bệnh mạn tính, vì vậy **tái nghiện có thể xảy ra** như một phần trong quá trình hồi phục. Tỷ lệ tái nghiện trong nghiện ma túy **tương đương với các bệnh mạn tính khác** như cao huyết áp và hen suyễn. Nếu người bệnh ngừng tuân theo kế hoạch điều trị, khả năng tái nghiện là cao.

![Biểu đồ: Tỷ lệ tái nghiện ở người nghiện (40–60%), cao huyết áp (50–70%) và hen suyễn (50–70%).](https://nida.nih.gov/sites/default/files/styles/content_image_medium/public/relapsechart.gif?itok=cbWRtJ65)

**Nguồn**: *JAMA, 284:1689–1695, 2000*  
Tái nghiện **không phải là thất bại**, mà là dấu hiệu cần tiếp tục, điều chỉnh, hoặc đổi phương pháp điều trị. Với một số loại ma túy, **tái nghiện có thể gây tử vong** vì cơ thể đã mất khả năng chịu đựng liều lượng trước đó.

---

## Các nguyên tắc điều trị hiệu quả

✅ Điều trị nghiện **opioids** (thuốc giảm đau kê toa, heroin, fentanyl) nên ưu tiên sử dụng **thuốc** kết hợp với **trị liệu hành vi**.

✅ Có thuốc hỗ trợ điều trị **nghiện rượu** và **nicotine**.

🚫 **Cai nghiện (detox)** không phải là điều trị. Nếu không có điều trị sau detox, người bệnh **dễ tái nghiện**.

🚫 Với ma túy như **cần sa** hay **chất kích thích**, chưa có thuốc hỗ trợ → điều trị bằng **trị liệu hành vi**.

📌 Điều trị cần **cá nhân hóa**, phù hợp với mô hình sử dụng, sức khỏe tâm thần, và hoàn cảnh xã hội của người bệnh.

---

## Thuốc và thiết bị hỗ trợ điều trị nghiện

### Các giai đoạn và hỗ trợ tương ứng:

- **Giai đoạn cai**: Giảm lo âu, mất ngủ, trầm cảm bằng thuốc.
- **Duy trì điều trị**: Giảm ham muốn, giúp não thích nghi dần, hỗ trợ tập trung vào trị liệu.
- **Phòng tái nghiện**: Hạn chế tác động từ môi trường, cảm xúc, và tiếp xúc với chất gây nghiện.

### 🌡️ Các thuốc thông dụng:

#### 🩸 Opioid:
  - Methadone  
  - Buprenorphine  
  - Naltrexone (dạng giải phóng kéo dài)  
  - Lofexidine  

#### 🚬 Nicotine:
  - Nicotine thay thế (miếng dán, kẹo cao su, ống hít)  
  - Bupropion  
  - Varenicline  

#### 🍷 Rượu:
  - Naltrexone  
  - Disulfiram  
  - Acamprosate  

---

## Trị liệu hành vi hỗ trợ điều trị nghiện

🧠 **Trị liệu hành vi** giúp người bệnh thay đổi **thái độ và hành vi** liên quan đến sử dụng chất gây nghiện, đối phó với áp lực và các yếu tố kích thích tái nghiện.

### Một số hình thức phổ biến:

- **Liệu pháp nhận thức – hành vi (CBT)**: Nhận biết, tránh né và đối phó với các tình huống dễ dẫn đến tái nghiện.
- **Quản lý dự phòng (Contingency Management)**: Thưởng cho hành vi tích cực như không sử dụng ma túy, đi trị liệu đều đặn.
- **Liệu pháp tăng cường động lực (Motivational Enhancement Therapy)**: Thúc đẩy động lực thay đổi hành vi.
- **Trị liệu gia đình**: Cải thiện mối quan hệ và giảm ảnh hưởng từ môi trường gia đình.
- **Hỗ trợ 12 bước (12-step Facilitation)**: Liệu pháp cá nhân giúp người bệnh tham gia chương trình như Alcoholics Anonymous.

📌 Các liệu pháp này không thay thế điều trị y tế, nhưng **hỗ trợ song song hiệu quả**.

---

## Điều trị toàn diện: Hơn cả việc ngưng sử dụng

❗ Dừng sử dụng ma túy chỉ là **bước đầu**. Người nghiện thường có các vấn đề liên quan đến **sức khỏe**, **gia đình**, **công việc**, và **pháp lý**.

🔎 Điều trị thành công cần giải quyết **toàn diện các khía cạnh** trong cuộc sống. Nhân viên điều trị có thể sử dụng nhiều dịch vụ hỗ trợ, tùy theo **nhu cầu cá nhân hóa** của mỗi người bệnh.

---

**Nguồn tham khảo đầy đủ: NIDA, NIH – National Institute on Drug Abuse**  
', N'markdown', N'{"author":"Admin","readingTime":"5 min","difficulty":"beginner"}')
INSERT [dbo].[Content] ([content_id], [program_id], [title], [type], [orders], [content_file_link], [content_type], [content_metadata_json]) VALUES (4, 2, N'Cai nghiện - con đường gian nan về với gia đình và cộng đồng', N'video', 2, N'https://www.youtube.com/watch?v=ZtQRt2qMlVw', N'video', N'{"author":"Admin","readingTime":"5 min","difficulty":"beginner"}')
INSERT [dbo].[Content] ([content_id], [program_id], [title], [type], [orders], [content_file_link], [content_type], [content_metadata_json]) VALUES (5, 3, N'Các dấu hiệu thể chất của việc sử dụng chất gây nghiện', N'markdown', 1, N'# 📘 Lạm Dụng Chất và Nghiện Ngập: Dấu Hiệu Nhận Biết Sớm

**Biết được các dấu hiệu sớm** có thể giúp bạn nhận ra vấn đề sử dụng chất gây nghiện ở chính bản thân hoặc người thân xung quanh.

---

## 🧠 Nghiện là gì?

Nói một cách đơn giản, **nghiện** là khi một người **tiếp tục lặp lại một hành vi** và **không thể dừng lại**, ngay cả khi họ muốn.

Nghiện ảnh hưởng nghiêm trọng đến:
- Các mối quan hệ
- Công việc
- Sức khỏe
- Chất lượng cuộc sống

Nó cũng có thể **gây tổn thương cho những người xung quanh**.

Nghiện là một tình trạng nghiêm trọng, có thể liên quan đến **mua sắm, tình dục, cờ bạc**, nhưng **phổ biến nhất** là liên quan đến **rượu và ma túy**.

---

## 💊 Lạm dụng chất là gì?

**Lạm dụng chất (substance misuse)** nghĩa là sử dụng thuốc **khác với mục đích ban đầu**.

Ví dụ:
- Dùng thuốc kê đơn với **liều cao hơn khuyến cáo**
- **Dùng thuốc quá lâu** so với thời gian điều trị cần thiết

---

## ⚠️ Có phải là vấn đề? Dấu hiệu cảnh báo sớm

Nghiện thường bắt đầu với việc **mất kiểm soát** về:
- Khi nào sử dụng
- Bao nhiêu lượng được sử dụng

Một người có thể:
- Dùng nhiều hơn dự định  
- Dùng dù không có ý định từ trước  

---

## 📋 Các triệu chứng phổ biến của nghiện

- **Muốn sử dụng ma túy hoặc uống rượu nhiều lần trong ngày**
- **Ám ảnh** với rượu hoặc ma túy, **nghĩ về chúng liên tục**
- **Không thể dừng lại**, dù có muốn  
- **Dành nhiều thời gian và tiền bạc** để tìm mua rượu hoặc ma túy, **dù không đủ khả năng tài chính**
- **Trở nên vô trách nhiệm** trong công việc, mối quan hệ, hoặc nghĩa vụ khác vì sử dụng chất  
- **Gặp triệu chứng cai nghiện** (như run, buồn nôn) khi không có rượu hoặc ma túy  

---

## 👀 Dấu hiệu nghiện ở người khác

Nếu bạn lo lắng cho một người bạn hoặc thành viên trong gia đình, bạn có thể nhận thấy:

- **Trở nên khép kín**, xa lánh, hoặc **giao du với nhóm bạn mới lạ**
- **Thay đổi ngoại hình**: sút cân hoặc tăng cân, xanh xao, **lơ là chăm sóc bản thân**
- **Có dấu hiệu không trung thực**: nói dối về việc đi đâu, ở với ai  
- **Lấy tiền hoặc vật có giá trị** mà không xin phép  

---

## 💡 Mỗi loại chất gây nghiện có tác động khác nhau

Người sử dụng các loại ma túy khác nhau có thể biểu hiện **rất đa dạng**.

🔍 Hãy tìm hiểu thêm về các loại chất tại [Alcohol and Drug Foundation](https://adf.org.au/drug-facts/).

---

', N'markdown', N'{"author":"Admin","readingTime":"5 min","difficulty":"beginner"}')
INSERT [dbo].[Content] ([content_id], [program_id], [title], [type], [orders], [content_file_link], [content_type], [content_metadata_json]) VALUES (6, 4, N'Hướng dẫn cho cha mẹ có con nghiện', N'markdown', 1, N'# 👪 Làm Gì Khi Con Bạn Đang Vật Lộn Với Nghiện Ngập

![father comforting son](#)

## ❤️ Giúp đỡ con cái trong cơn nghiện

Việc cố gắng giúp đỡ con bạn vượt qua nghiện ngập nhưng không thấy hiệu quả có thể rất đau đớn và khiến bạn nản lòng. Tuy nhiên, **kiên nhẫn, thấu hiểu và yêu thương không phán xét** là những yếu tố quan trọng giúp bạn **duy trì hy vọng**.

Ngay cả khi bạn đã thử nhiều cách, bạn vẫn có thể tìm được cơ hội để **truyền đạt mối quan tâm của mình**. **Khuyến khích con bạn tìm kiếm sự giúp đỡ có thể cần nhiều lần trò chuyện khó khăn**, nhưng hãy nhớ rằng sự kiên trì có thể được đền đáp.

⚠️ Trừ khi có lệnh của tòa án, **bạn không thể ép một người trưởng thành cai nghiện** hoặc đi điều trị. Tuy nhiên, bạn vẫn có thể làm những điều sau:

- 📅 **Chọn thời điểm thích hợp**: Trò chuyện khi chỉ có hai người, nơi yên tĩnh, không bị gián đoạn.
- 💬 **Trình bày trực tiếp, rõ ràng nhưng đầy yêu thương**: Tránh chỉ trích, đổ lỗi hay hạ thấp.
- 👂 **Lắng nghe không phán xét**: Cho con bạn không gian an toàn để chia sẻ cảm xúc.
- 🤝 **Cam kết hỗ trợ thực tế**: Giúp tìm hiểu chi phí điều trị, hỗ trợ sử dụng bảo hiểm, tìm trung tâm cai nghiện phù hợp.
- 👩‍⚕️ **Khuyến khích gặp bác sĩ**: Trẻ thường nghe lời chuyên gia hơn cha mẹ.

🔗 *Xem toàn bộ loạt bài “Hồi phục là một hành trình” tại đây.*

---

## 🧪 Dấu hiệu con bạn đang nghiện rượu hoặc ma túy

Nghiện không phải lúc nào cũng dễ phát hiện. Theo **DSM-5** của Hiệp hội Tâm thần Hoa Kỳ, "rối loạn sử dụng chất" là thuật ngữ lâm sàng cho nghiện.

### 🔍 Một số tiêu chí chẩn đoán:

- Sử dụng với liều lượng cao hoặc thường xuyên hơn dự kiến.
- Không thể dừng lại dù có mong muốn cai.
- Tốn nhiều thời gian để tìm, sử dụng, hoặc hồi phục sau khi dùng.
- Thèm chất mạnh mẽ về thể chất hoặc tinh thần.
- Bỏ bê nghĩa vụ ở nhà, trường học, hoặc nơi làm việc.
- Tiếp tục sử dụng dù gây hại cho các mối quan hệ.
- Rút lui khỏi các hoạt động từng yêu thích.
- Sử dụng trong tình huống nguy hiểm (lái xe, vận hành máy).
- Tiếp tục dùng dù rõ ràng gây hại cho sức khỏe.
- Tăng liều để đạt hiệu quả (dung nạp).
- Dùng để tránh triệu chứng cai.

### 👀 Dấu hiệu dễ nhận biết khác:

- Thay đổi nhóm bạn đột ngột  
- Kém chăm sóc bản thân  
- Bỏ học, nghỉ làm  
- Gặp rắc rối pháp lý  
- Thói quen ăn ngủ thất thường  
- Mối quan hệ xấu đi với gia đình, bạn bè  

---

## 🏥 Làm sao đưa con trưởng thành vào trung tâm cai nghiện?

Chứng kiến con đau khổ mà không thể giúp đỡ có thể khiến bạn bất lực. Nhưng hãy nhớ rằng **con bạn là người trưởng thành** và có quyền tự quyết định.

Bạn có thể:
- 📞 Hỗ trợ gọi đến trung tâm cai nghiện
- 📋 Hỏi về quy trình nhập viện và thông tin cá nhân cần cung cấp (được giữ bảo mật)
- 💵 Tìm hiểu chi phí, kiểm tra bảo hiểm
- 🏨 Xác định hình thức điều trị phù hợp: nội trú, ngoại trú, ngắn hạn, dài hạn

Sau khi nhập viện, bạn có thể hỗ trợ bằng cách:
- 💬 Luôn động viên tinh thần tích cực
- 👨‍👩‍👧‍👦 Tham gia trị liệu gia đình
- 🚗 Hỗ trợ phương tiện nếu cần đi nhóm hỗ trợ như AA, NA
- 🚫 Không sử dụng hoặc trữ chất gây nghiện trong nhà nếu con bạn sống cùng

---

## 🧘‍♂️ Chăm sóc bản thân khi giúp con nghiện

Nghiện không chỉ ảnh hưởng người dùng, mà còn **tác động sâu sắc đến gia đình**. Cha mẹ thường:
- Tự trách bản thân  
- Nghĩ mình thất bại  
- Cho rằng con chọn chất gây nghiện hơn gia đình  
- Không nhận ra nghiện là bệnh lý cần điều trị

### 🧠 Căng thẳng người chăm sóc (Caregiver stress)

Nếu bạn phải gánh vác trách nhiệm của con, bạn có thể:
- Cảm thấy kiệt sức  
- Khó kiểm soát cảm xúc  
- Mất năng lượng, bị quá tải  

👉 *Bạn **không gây ra** nghiện của con mình.*  
👉 *Bạn **cũng cần được chăm sóc***.

### 🌱 Mẹo chăm sóc bản thân

- 😴 Ngủ đủ, ăn lành mạnh, khám định kỳ
- 👯 Dành thời gian với bạn bè, hoạt động yêu thích
- 🧱 Đặt ranh giới rõ ràng, **tránh tiếp tay** (cho tiền, đóng phí pháp lý…)
- 🤝 Tham gia nhóm hỗ trợ cho người thân (Al-Anon, Nar-Anon)
- 📣 Biết yêu cầu giúp đỡ: bạn bè sẵn sàng hỗ trợ nếu bạn lên tiếng


', N'markdown', N'{"author":"Admin","readingTime":"5 min","difficulty":"beginner"}')
SET IDENTITY_INSERT [dbo].[Content] OFF
GO
INSERT [dbo].[Profile] ([user_id], [name], [bio_json], [date_of_birth], [job]) VALUES (1, N'Quản trị viên', N' "Quản trị viên hệ thống cho nền tảng phòng chống ma túy"}', CAST(N'1985-05-15' AS Date), N'Quản trị hệ thống')
INSERT [dbo].[Profile] ([user_id], [name], [bio_json], [date_of_birth], [job]) VALUES (2, N'tran thanh trung', NULL, CAST(N'2004-01-01' AS Date), N'College Student')
GO
SET IDENTITY_INSERT [dbo].[Programs] ON 

INSERT [dbo].[Programs] ([program_id], [img_link], [title], [description], [create_by], [status], [age_group], [create_at], [category_id]) VALUES (1, N'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTelqRzfPSosi_jy-wavWCLQhKRjisVsjFUaQ&s', N'Hiểu về não bộ và nghiện', N'N/A', 1, N'active', N'youth', CAST(N'2025-07-11T18:36:16.000' AS DateTime), 1)
INSERT [dbo].[Programs] ([program_id], [img_link], [title], [description], [create_by], [status], [age_group], [create_at], [category_id]) VALUES (2, N'https://s33174.pcdn.co/wp-content/uploads/2021/03/Drug-Rehab.jpg', N'Khoa học về phục hồi', N'N/A', 1, N'active', N'adult', CAST(N'2025-07-11T19:01:38.000' AS DateTime), 1)
INSERT [dbo].[Programs] ([program_id], [img_link], [title], [description], [create_by], [status], [age_group], [create_at], [category_id]) VALUES (3, N'https://www.dianova.org/wp-content/uploads/2020/12/addiction-prevention.jpg', N'Nhận biết dấu hiệu sớm', N'N/A', 1, N'active', N'adult', CAST(N'2025-07-11T19:09:04.000' AS DateTime), 2)
INSERT [dbo].[Programs] ([program_id], [img_link], [title], [description], [create_by], [status], [age_group], [create_at], [category_id]) VALUES (4, N'data:image/jpeg;base64,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', N'Chương trình hỗ trợ gia đình', N'N/A', 1, N'active', N'adult', CAST(N'2025-07-11T19:20:46.000' AS DateTime), 3)
SET IDENTITY_INSERT [dbo].[Programs] OFF
GO
SET IDENTITY_INSERT [dbo].[Slot] ON 

INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (1, CAST(N'08:00:00' AS Time), CAST(N'09:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (2, CAST(N'09:00:00' AS Time), CAST(N'10:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (3, CAST(N'10:00:00' AS Time), CAST(N'11:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (4, CAST(N'11:00:00' AS Time), CAST(N'12:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (5, CAST(N'13:00:00' AS Time), CAST(N'14:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (6, CAST(N'14:00:00' AS Time), CAST(N'15:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (7, CAST(N'15:00:00' AS Time), CAST(N'16:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (8, CAST(N'16:00:00' AS Time), CAST(N'17:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (9, CAST(N'18:00:00' AS Time), CAST(N'19:00:00' AS Time))
INSERT [dbo].[Slot] ([slot_id], [start_time], [end_time]) VALUES (10, CAST(N'19:00:00' AS Time), CAST(N'20:00:00' AS Time))
SET IDENTITY_INSERT [dbo].[Slot] OFF
GO
SET IDENTITY_INSERT [dbo].[Consultant] ON 

INSERT [dbo].[Consultant] ([id_consultant], [user_id], [google_meet_link], [certification], [speciality]) VALUES (1, 3, N'https://meet.google.com/abc-defg-hij', N'Chứng chỉ tư vấn nghiện chất cấp 1, Bằng cử nhân Tâm lý học', N'Tư vấn phòng chống ma túy cho thanh thiếu niên')
INSERT [dbo].[Consultant] ([id_consultant], [user_id], [google_meet_link], [certification], [speciality]) VALUES (2, 4, N'https://meet.google.com/xyz-uvwx-mno', N'Thạc sĩ Tâm lý lâm sàng, Chứng chỉ điều trị nghiện chất', N'Tư vấn phục hồi và điều trị nghiện chất')
INSERT [dbo].[Consultant] ([id_consultant], [user_id], [google_meet_link], [certification], [speciality]) VALUES (3, 5, N'https://meet.google.com/pqr-stuv-wxy', N'Bác sĩ chuyên khoa Tâm thần, Chứng chỉ tư vấn gia đình', N'Tư vấn hỗ trợ gia đình có người nghiện')
SET IDENTITY_INSERT [dbo].[Consultant] OFF
GO
SET IDENTITY_INSERT [dbo].[Surveys] ON 

INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (1, 1, N'pre-assessment', N'{"questions":[{"id":1,"question":"Bộ não con người nặng khoảng bao nhiêu?","options":["0.5kg","1.3kg ","2kg"," 3kg"]},{"id":2,"question":"Chất dẫn truyền thần kinh (neurotransmitter) là gì?","options":["Tế bào não","Chất hóa học truyền tín hiệu giữa các nơron","Một loại protein","Không biết"]},{"id":3,"question":" Dopamine có vai trò gì trong não bộ?","options":["Chỉ tạo cảm giác vui","Giúp ghi nhớ và lặp lại hành vi"," Điều khiển nhịp tim","Không rõ"]},{"id":4,"question":"Theo bạn, ma túy ảnh hưởng đến não như thế nào?","options":["Không ảnh hưởng gì","Chỉ ảnh hưởng tạm thời","Thay đổi cách hoạt động của não","Chưa từng nghĩ về điều này"]},{"id":5,"question":"Mức độ hiểu biết hiện tại của bạn về não bộ và ma túy:","options":["Rất ít","Ít","Trung bình","Nhiều","Rất nhiều"]}]}')
INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (2, 1, N'post-assessment', N'{"questions":[{"id":1,"question":" Nơron truyền tín hiệu với nhau thông qua","options":["Điện trực tiếp","Chất dẫn truyền thần kinh","Sóng âm thanh","Ánh sáng"]},{"id":2,"question":"Những vùng não nào bị ảnh hưởng chính khi sử dụng ma túy?","options":[" Chỉ thân não","Hạch nền, hạch hạnh nhân mở rộng, vỏ não trước trán","Chỉ vỏ não","Toàn bộ não đều như nhau"]},{"id":3,"question":"Tại sao ma túy gây nghiện mạnh hơn phần thưởng tự nhiên?","options":["Vì nó rẻ hơn","Vì nó tạo ra lượng dopamine vượt trội","Vì nó dễ kiếm hơn","Không có sự khác biệt"]},{"id":4,"question":"Nội dung chương trình này có dễ hiểu không?","options":["Rất dễ hiểu"," Dễ hiểu","Bình thường","Khó hiểu"," Rất khó hiểu"]},{"id":5,"question":"Thông tin trong chương trình có hữu ích không?","options":["Rất hữu ích","Hữu ích","Bình thường","Ít hữu ích","Không hữu ích"]}]}')
INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (3, 2, N'pre-assessment', N'{"questions":[{"id":1,"question":"Nghiện có thể điều trị thành công không?","options":["Có, nghiện có thể điều trị","Không, nghiện không thể chữa khỏi","Chỉ một số loại nghiện","Không rõ"]},{"id":2,"question":"Tái nghiện có đồng nghĩa với điều trị thất bại không?","options":["Có, tái nghiện là thất bại","Không, tái nghiện là phần của quá trình hồi phục","Tùy thuộc vào loại ma túy","Không chắc chắn"]},{"id":3,"question":"Detox (cai nghiện) có phải là điều trị hoàn chỉnh không?","options":["Có, detox là đủ","Không, cần điều trị tiếp tục sau detox","Chỉ cần detox với một số chất","Không biết"]},{"id":4,"question":"Mức độ hiểu biết của bạn về điều trị nghiện:","options":["Rất ít","Ít","Trung bình","Nhiều","Rất nhiều"]},{"id":5,"question":"Bạn có tin rằng não có thể phục hồi sau nghiện không?","options":["Có","Không","Một phần","Không chắc"]}]}')
INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (4, 2, N'post-assessment', N'{"questions":[{"id":1,"question":"Nghiện là một bệnh mạn tính có thể điều trị như các bệnh khác không?","options":["Có, giống như cao huyết áp và hen suyễn","Không, nghiện khác hoàn toàn","Chỉ một số trường hợp","Không rõ"]},{"id":2,"question":"Thuốc nào được sử dụng để điều trị nghiện opioid?","options":["Chỉ có Methadone","Methadone, Buprenorphine, Naltrexone","Chỉ có aspirin","Không có thuốc nào"]},{"id":3,"question":"Trị liệu hành vi giúp gì trong điều trị nghiện?","options":["Chỉ thay đổi suy nghĩ","Thay đổi thái độ và hành vi, đối phó với áp lực","Chỉ giúp giải trí","Không có tác dụng"]},{"id":4,"question":"Chương trình này có hữu ích với bạn không?","options":["Rất hữu ích","Hữu ích","Bình thường","Ít hữu ích","Không hữu ích"]},{"id":5,"question":"Bạn có muốn tìm hiểu thêm về điều trị nghiện không?","options":["Rất muốn","Muốn","Có thể","Ít muốn","Không muốn"]}]}')
INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (5, 3, N'pre-assessment', N'{"questions":[{"id":1,"question":"Lạm dụng chất là gì?","options":["Sử dụng thuốc đúng cách","Sử dụng thuốc khác mục đích ban đầu","Chỉ sử dụng ma túy","Không biết"]},{"id":2,"question":"Dấu hiệu nào cho thấy một người có thể đang nghiện?","options":["Chỉ sút cân","Mất kiểm soát, ám ảnh với chất","Chỉ thay đổi bạn bè","Không có dấu hiệu rõ ràng"]},{"id":3,"question":"Ai có thể bị nghiện?","options":["Chỉ người nghèo","Chỉ người giàu","Bất kỳ ai","Chỉ thanh thiếu niên"]},{"id":4,"question":"Mức độ hiểu biết của bạn về dấu hiệu nghiện:","options":["Rất ít","Ít","Trung bình","Nhiều","Rất nhiều"]},{"id":5,"question":"Bạn có tự tin nhận biết dấu hiệu nghiện ở người khác không?","options":["Rất tự tin","Tự tin","Bình thường","Ít tự tin","Không tự tin"]}]}')
INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (6, 3, N'post-assessment', N'{"questions":[{"id":1,"question":"Nghiện bắt đầu khi nào?","options":["Khi có triệu chứng cai","Khi mất kiểm soát về thời gian và lượng sử dụng","Khi sử dụng lần đầu","Khi có vấn đề pháp lý"]},{"id":2,"question":"Dấu hiệu nghiện theo DSM-5 bao gồm:","options":["Chỉ thèm chất","Mất kiểm soát, thèm chất, bỏ bê nghĩa vụ","Chỉ tăng liều","Chỉ có triệu chứng cai"]},{"id":3,"question":"Thay đổi ngoại hình có thể bao gồm:","options":["Chỉ sút cân","Sút cân hoặc tăng cân, xanh xao, lơ là chăm sóc","Chỉ thay đổi kiểu tóc","Không có thay đổi"]},{"id":4,"question":"Sau khi học, bạn cảm thấy tự tin nhận biết dấu hiệu nghiện hơn không?","options":["Rất tự tin","Tự tin","Bình thường","Ít tự tin","Không tự tin"]},{"id":5,"question":"Thông tin trong chương trình có thực tế và hữu ích không?","options":["Rất thực tế và hữu ích","Thực tế và hữu ích","Bình thường","Ít thực tế","Không thực tế"]}]}')
INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (7, 4, N'pre-assessment', N'{"questions":[{"id":1,"question":"Khi con bạn nghiện, điều đầu tiên bạn nên làm là gì?","options":["La mắng và phạt","Lắng nghe không phán xét","Cắt đứt quan hệ","Cho tiền mua ma túy"]},{"id":2,"question":"Bạn có thể ép một người trưởng thành cai nghiện không?","options":["Có, luôn luôn","Có, nếu có lệnh tòa án","Không bao giờ","Tùy tình huống"]},{"id":3,"question":"Nghiện ảnh hưởng đến gia đình như thế nào?","options":["Chỉ ảnh hưởng người nghiện","Ảnh hưởng toàn bộ gia đình","Chỉ ảnh hưởng tài chính","Không ảnh hưởng gì"]},{"id":4,"question":"Mức độ hiểu biết của bạn về cách hỗ trợ người thân nghiện:","options":["Rất ít","Ít","Trung bình","Nhiều","Rất nhiều"]},{"id":5,"question":"Bạn có nghĩ mình gây ra nghiện của con không?","options":["Hoàn toàn có lỗi","Một phần có lỗi","Không có lỗi","Không chắc chắn"]}]}')
INSERT [dbo].[Surveys] ([survey_id], [program_id], [type], [questions_json]) VALUES (8, 4, N'post-assessment', N'{"questions":[{"id":1,"question":"Cách tốt nhất để trò chuyện với con về nghiện là:","options":["La mắng để răn đe","Trình bày trực tiếp, rõ ràng nhưng đầy yêu thương","Tránh né chủ đề","Đe dọa cắt hỗ trợ tài chính"]},{"id":2,"question":"Bạn có thể hỗ trợ con như thế nào trong điều trị?","options":["Chỉ cho tiền","Động viên tinh thần, tham gia trị liệu gia đình","Tránh xa để con tự lập","Kiểm soát mọi hoạt động"]},{"id":3,"question":"Chăm sóc bản thân khi có con nghiện bao gồm:","options":["Hy sinh mọi thứ cho con","Ngủ đủ, ăn lành mạnh, đặt ranh giới","Chỉ tập trung vào con","Cô lập khỏi bạn bè"]},{"id":4,"question":"Chương trình này có giúp bạn hiểu cách hỗ trợ con tốt hơn không?","options":["Rất nhiều","Nhiều","Bình thường","Ít","Không"]},{"id":5,"question":"Bạn có cảm thấy tự tin hơn trong việc giúp đỡ con không?","options":["Rất tự tin","Tự tin","Bình thường","Ít tự tin","Không tự tin"]}]}')
SET IDENTITY_INSERT [dbo].[Surveys] OFF
GO
SET IDENTITY_INSERT [dbo].[Users] ON 

INSERT [dbo].[Users] ([user_id], [img_link], [date_create], [role], [password], [status], [email]) VALUES (1, N'/uploads/profile-pictures/default-admin.png', CAST(N'2025-07-11T17:33:20.363' AS DateTime), N'admin', N'hashed_password_123', N'active', N'admin@drugprevention.com')
INSERT [dbo].[Users] ([user_id], [img_link], [date_create], [role], [password], [status], [email]) VALUES (2, N'/uploads/profile-pictures/google-profile-2-1752236823148.jpg', CAST(N'2025-07-11T19:27:02.903' AS DateTime), N'Member', N'100479389030787881106', N'active', N'tranthanhtrung2015@gmail.com')
SET IDENTITY_INSERT [dbo].[Users] OFF
GO
/****** Object:  Index [UQ__Consulta__B9BE370E7421D75A]    Script Date: 11/07/2025 19:55:04 ******/
ALTER TABLE [dbo].[Consultant] ADD UNIQUE NONCLUSTERED 
(
	[user_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__Users__AB6E616447136B1D]    Script Date: 11/07/2025 19:55:04 ******/
ALTER TABLE [dbo].[Users] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT (getdate()) FOR [date_create]
GO
ALTER TABLE [dbo].[Assessments]  WITH CHECK ADD FOREIGN KEY([action_id])
REFERENCES [dbo].[Action] ([action_id])
GO
ALTER TABLE [dbo].[Assessments]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Blogs]  WITH CHECK ADD FOREIGN KEY([author_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Booking_Session]  WITH CHECK ADD FOREIGN KEY([consultant_id])
REFERENCES [dbo].[Consultant] ([id_consultant])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Booking_Session]  WITH CHECK ADD FOREIGN KEY([member_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Booking_Session]  WITH CHECK ADD FOREIGN KEY([slot_id])
REFERENCES [dbo].[Slot] ([slot_id])
GO
ALTER TABLE [dbo].[Consultant]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Consultant_Slot]  WITH CHECK ADD FOREIGN KEY([consultant_id])
REFERENCES [dbo].[Consultant] ([id_consultant])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Consultant_Slot]  WITH CHECK ADD FOREIGN KEY([slot_id])
REFERENCES [dbo].[Slot] ([slot_id])
GO
ALTER TABLE [dbo].[Content]  WITH CHECK ADD FOREIGN KEY([program_id])
REFERENCES [dbo].[Programs] ([program_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Enroll]  WITH CHECK ADD FOREIGN KEY([program_id])
REFERENCES [dbo].[Programs] ([program_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Enroll]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Flags]  WITH CHECK ADD FOREIGN KEY([blog_id])
REFERENCES [dbo].[Blogs] ([blog_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Flags]  WITH CHECK ADD FOREIGN KEY([flagged_by])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Profile]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Programs]  WITH CHECK ADD FOREIGN KEY([category_id])
REFERENCES [dbo].[Category] ([category_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Programs]  WITH CHECK ADD FOREIGN KEY([create_by])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Survey_Responses]  WITH CHECK ADD FOREIGN KEY([survey_id])
REFERENCES [dbo].[Surveys] ([survey_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Survey_Responses]  WITH CHECK ADD FOREIGN KEY([user_id])
REFERENCES [dbo].[Users] ([user_id])
GO
ALTER TABLE [dbo].[Surveys]  WITH CHECK ADD FOREIGN KEY([program_id])
REFERENCES [dbo].[Programs] ([program_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Users]  WITH CHECK ADD CHECK  (([status]=N'banned' OR [status]=N'inactive' OR [status]=N'active'))
GO
USE [master]
GO
ALTER DATABASE [SWP391-demo] SET  READ_WRITE 
GO
