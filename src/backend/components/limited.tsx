import { FC} from "hono/jsx";

export const Limited: FC = () => {
  return (
    <div>
        <p>You've filled in our forms too many times in the last hour! You can fill them in:</p> 
        <ul>
            <li>Landing - 4 Times Per Hour</li>
            <li>Bug/Feature etc. - 4 Times Per Hour combined</li>
        </ul>
        <p>Essentially, basic feedback 4 times an hour AND complex feedback 4 times an hour.</p>
        <div class="center"><button id="restart">Restart</button></div>
    </div>
  )
}


