import { ImageViewer } from '@endo4life/feature-image-viewer';
import { dataMapper, MOCK_DATA } from './mock_data';

export default function CommentsPage() {
  const data = dataMapper.toImage(MOCK_DATA);
  return (
    <div className="h-full p-4 bg-slate-100">
      <div className="flex items-start h-full gap-4 p-4">
        <div className="flex-auto h-full overflow-hidden overflow-y-auto bg-white rounded">
          <ImageViewer image={data.image} annotations={data.annotations} />
          <section className="p-4">
            <h2 className="text-sm font-semibold">TAGS</h2>
            <ul className="flex items-center gap-2 py-3">
              {MOCK_DATA.image_tag_list.map((item) => {
                return (
                  <li
                    className="flex items-center justify-center px-3 py-1 text-xs bg-white border rounded-full text-slate-900 border-slate-700"
                    key={item.id}
                  >
                    {item.display_name}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="px-4 pb-4">
            <h2 className="text-sm font-semibold">ANNOTATIONS</h2>
            <div className="">
              {MOCK_DATA.region_list_at_publish_time.map((item) => {
                return (
                  <div className="my-2">
                    <h3 className="flex items-center gap-2">
                      <span
                        className="w-4 h-4"
                        style={{ backgroundColor: item.label.color }}
                      ></span>
                      <span className="flex-auto">
                        {item.label.display_name}
                      </span>
                    </h3>
                    <ul className="px-6 list-disc">
                      <li>
                        <span>Drawn by:</span>
                        <span>{item.drawn_by_user.display_name}</span>
                      </li>
                      <li>
                        <span>Labeled By:</span>
                        <span>{item.labeled_by_user.display_name}</span>
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
        <div className="flex-none w-1/2 h-full bg-white border-l rounded"></div>
      </div>
    </div>
  );
}
